import ExcelJS from 'exceljs'
import type { Transaction, WalletWithBalance, Category } from '@/types'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

interface FinanceExportData {
  transactions: Transaction[]
  wallets: WalletWithBalance[]
  categories: Category[]
  totalBalance: number
  totalIncome: number
  totalExpense: number
  netIncome: number
  startDate?: string
  endDate?: string
}

export async function exportFinanceExcel(data: FinanceExportData): Promise<void> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Worksphere'
  workbook.created = new Date()

  // ─── Sheet 1: Ringkasan & Dompet ──────────────────────────────────────────
  const sheet1 = workbook.addWorksheet('Ringkasan Kas')

  sheet1.columns = [
    { header: 'Kategori / Bagian', key: 'label', width: 25 },
    { header: 'Nilai / Jumlah (IDR)', key: 'value', width: 25 },
    { header: 'Keterangan Tambahan', key: 'notes', width: 25 },
  ]

  sheet1.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
  sheet1.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2563EB' },
  }

  sheet1.addRow({ label: 'Total Saldo Bersih', value: data.totalBalance, notes: 'Akumulasi seluruh dompet' })
  sheet1.addRow({ label: 'Total Pemasukan', value: data.totalIncome, notes: 'Periode berjalan' })
  sheet1.addRow({ label: 'Total Pengeluaran', value: data.totalExpense, notes: 'Periode berjalan' })
  sheet1.addRow({ label: 'Arus Kas Bersih', value: data.netIncome, notes: 'Pemasukan dikurangi pengeluaran' })

  sheet1.addRow({})
  const walletHeaderRow = sheet1.addRow({ label: 'DAFTAR DOMPET / REKENING', value: 'TIPE', notes: 'SALDO' })
  walletHeaderRow.font = { bold: true, color: { argb: 'FFFFFF' } }
  walletHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '3B82F6' },
  }

  for (const w of data.wallets) {
    sheet1.addRow({
      label: w.name,
      value: w.type.toUpperCase(),
      notes: `Rp ${w.balance.toLocaleString('id-ID')}`,
    })
  }

  // ─── Sheet 2: Riwayat Transaksi ───────────────────────────────────────────
  const sheet2 = workbook.addWorksheet('Riwayat Transaksi')

  sheet2.columns = [
    { header: 'Tanggal', key: 'date', width: 18 },
    { header: 'Tipe', key: 'type', width: 15 },
    { header: 'Kategori', key: 'category', width: 20 },
    { header: 'Dompet / Rekening', key: 'wallet', width: 20 },
    { header: 'Keterangan', key: 'desc', width: 30 },
    { header: 'Nominal (IDR)', key: 'amount', width: 18 },
  ]

  sheet2.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
  sheet2.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2563EB' },
  }

  const categoryMap = new Map(data.categories.map(c => [c.id, c.name]))
  const walletMap = new Map(data.wallets.map(w => [w.id, w.name]))

  const sortedTransactions = [...data.transactions].sort((a, b) =>
    b.transaction_date.localeCompare(a.transaction_date)
  )

  for (const t of sortedTransactions) {
    const catName = t.category_id ? categoryMap.get(t.category_id) || '-' : '-'
    const walletName = t.wallet_id ? walletMap.get(t.wallet_id) || '-' : '-'
    const isIncome = t.type === 'income'

    sheet2.addRow({
      date: format(parseISO(t.transaction_date), 'd MMMM yyyy', { locale: id }),
      type: isIncome ? 'Pemasukan' : 'Pengeluaran',
      category: catName,
      wallet: walletName,
      desc: t.description || '-',
      amount: `${isIncome ? '+' : '-'} Rp ${t.amount.toLocaleString('id-ID')}`,
    })
  }

  // Generate buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const dateStamp = format(new Date(), 'yyyyMMdd-HHmm')
  a.download = `laporan-keuangan-${dateStamp}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
