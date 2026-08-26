import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Transaction, WalletWithBalance, Category } from '@/types'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { formatCurrency } from '@/utils/currency'

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

export function exportFinancePdf(data: FinanceExportData): void {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(16)
  doc.text('Laporan Keuangan Kas WorkSphere', 14, 20)

  doc.setFontSize(10)
  const periodText = data.startDate && data.endDate
    ? `Periode: ${data.startDate} s/d ${data.endDate}`
    : `Periode: Semua Data Transaksi`
  doc.text(periodText, 14, 28)
  doc.text(`Dicetak: ${format(new Date(), 'd MMMM yyyy, HH:mm', { locale: id })}`, 14, 34)

  // Financial Summary Section
  doc.setFontSize(11)
  doc.text('Ringkasan Saldo & Arus Kas', 14, 44)

  const summaryRows = [
    ['Total Saldo Bersih', formatCurrency(data.totalBalance)],
    ['Total Pemasukan', `+${formatCurrency(data.totalIncome)}`],
    ['Total Pengeluaran', `-${formatCurrency(data.totalExpense)}`],
    ['Arus Kas Bersih', `${data.netIncome >= 0 ? '+' : ''}${formatCurrency(data.netIncome)}`],
  ]

  autoTable(doc, {
    startY: 48,
    head: [['Keterangan Ringkasan', 'Jumlah (IDR)']],
    body: summaryRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  // Wallets Section
  const nextY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.text('Rincian Saldo per Dompet / Rekening', 14, nextY)

  const walletRows = data.wallets.map(w => [
    w.name,
    w.type.toUpperCase(),
    w.is_active ? 'Aktif' : 'Nonaktif',
    formatCurrency(w.balance),
  ])

  autoTable(doc, {
    startY: nextY + 4,
    head: [['Nama Dompet', 'Tipe', 'Status', 'Saldo Saat Ini']],
    body: walletRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Transaction History Section
  const transY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.text('Riwayat Transaksi', 14, transY)

  const categoryMap = new Map(data.categories.map(c => [c.id, c.name]))
  const walletMap = new Map(data.wallets.map(w => [w.id, w.name]))

  const sortedTransactions = [...data.transactions].sort((a, b) =>
    b.transaction_date.localeCompare(a.transaction_date)
  )

  const transactionRows = sortedTransactions.map(t => {
    const catName = t.category_id ? categoryMap.get(t.category_id) || '-' : '-'
    const walletName = t.wallet_id ? walletMap.get(t.wallet_id) || '-' : '-'
    const typeLabel = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'
    const sign = t.type === 'income' ? '+' : '-'

    return [
      format(new Date(t.transaction_date), 'd MMM yyyy', { locale: id }),
      typeLabel,
      catName,
      walletName,
      t.note || '-',
      `${sign}${formatCurrency(t.amount)}`,
    ]
  })

  autoTable(doc, {
    startY: transY + 4,
    head: [['Tanggal', 'Tipe', 'Kategori', 'Dompet', 'Keterangan', 'Nominal']],
    body: transactionRows,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  })

  const dateStamp = format(new Date(), 'yyyyMMdd-HHmm')
  doc.save(`laporan-keuangan-${dateStamp}.pdf`)
}
