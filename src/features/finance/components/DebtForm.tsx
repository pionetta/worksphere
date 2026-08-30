import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createDebtSchema } from '@/features/finance/schemas/debtSchema'
import { DurationPicker } from '@/features/finance/components/DurationPicker'
import { calculateTargetBreakdown } from '@/features/finance/utils/paymentCalculator'
import { formatCurrency } from '@/utils/currency'
import { Calculator, Calendar, CreditCard, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DebtType } from '@/types'

const GROUP_SUGGESTIONS = [
  'Shopee Paylater',
  'GoPay Later',
  'Kredivo',
  'Akulaku',
  'Kartu Kredit',
  'Bank / KTA',
  'Keluarga',
  'Teman / Rekan',
  'Kantor / Tempat Kerja',
]

interface DebtFormProps {
  initialType?: DebtType
  initialPersonName?: string
  initialGroupName?: string | null
  initialAmount?: number
  initialDueDate?: string
  initialNote?: string
  initialIsInstallment?: boolean
  initialInstallmentCount?: number | null
  initialInstallmentAmount?: number | null
  initialInstallmentDueDay?: number | null
  onSubmit: (data: {
    type: DebtType
    person_name: string
    group_name?: string | null
    amount: number
    due_date?: string | null
    is_installment?: boolean
    installment_count?: number | null
    installment_amount?: number | null
    installment_due_day?: number | null
    note?: string
  }) => Promise<void> | void
  onCancel: () => void
  submitLabel?: string
}

export function DebtForm({
  initialType = 'debt',
  initialPersonName = '',
  initialGroupName = '',
  initialAmount,
  initialDueDate = '',
  initialNote = '',
  initialIsInstallment = false,
  initialInstallmentCount = null,
  initialInstallmentAmount = null,
  initialInstallmentDueDay = null,
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: DebtFormProps) {
  const [type, setType] = useState<DebtType>(initialType)
  const [personName, setPersonName] = useState(initialPersonName)
  const [groupName, setGroupName] = useState(initialGroupName || '')
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '')
  const [dueDate, setDueDate] = useState(initialDueDate)
  const [note, setNote] = useState(initialNote)

  // Installment state (Pinjol / Paylater / Cicilan)
  const [isInstallment, setIsInstallment] = useState(initialIsInstallment)
  const [installmentCount, setInstallmentCount] = useState<string>(
    initialInstallmentCount ? String(initialInstallmentCount) : '6'
  )
  const [installmentAmount, setInstallmentAmount] = useState<string>(
    initialInstallmentAmount ? String(initialInstallmentAmount) : ''
  )
  const [installmentDueDay, setInstallmentDueDay] = useState<string>(
    initialInstallmentDueDay ? String(initialInstallmentDueDay) : '10'
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const parsedAmount = useMemo(() => {
    const val = parseInt(amount, 10)
    return isNaN(val) ? 0 : val
  }, [amount])

  const parsedCount = useMemo(() => {
    const val = parseInt(installmentCount, 10)
    return isNaN(val) || val <= 0 ? 1 : val
  }, [installmentCount])

  // Auto-fill installment amount if empty and total amount is provided
  useEffect(() => {
    if (isInstallment && parsedAmount > 0 && !installmentAmount) {
      const perMonth = Math.ceil(parsedAmount / parsedCount)
      setInstallmentAmount(String(perMonth))
    }
  }, [isInstallment, parsedAmount, parsedCount, installmentAmount])

  const breakdown = useMemo(() => {
    return calculateTargetBreakdown(parsedAmount, dueDate)
  }, [parsedAmount, dueDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedDueDay = parseInt(installmentDueDay, 10)
    const parsedInstAmount = parseInt(installmentAmount, 10)

    const result = createDebtSchema.safeParse({
      type,
      person_name: personName,
      group_name: groupName.trim() || null,
      amount: parsedAmount,
      due_date: dueDate || null,
      is_installment: isInstallment,
      installment_count: isInstallment ? parsedCount : null,
      installment_amount: isInstallment && !isNaN(parsedInstAmount) ? parsedInstAmount : null,
      installment_due_day:
        isInstallment && !isNaN(parsedDueDay) && parsedDueDay >= 1 && parsedDueDay <= 31
          ? parsedDueDay
          : null,
      note: note || undefined,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const err of result.error.issues) {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        type: result.data.type,
        person_name: result.data.person_name,
        group_name: result.data.group_name ?? null,
        amount: result.data.amount,
        due_date: result.data.due_date,
        is_installment: result.data.is_installment,
        installment_count: result.data.installment_count,
        installment_amount: result.data.installment_amount,
        installment_due_day: result.data.installment_due_day,
        note: result.data.note ?? undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Toggle */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Tipe
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setType('debt')}
            className={cn(
              'py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
              type === 'debt'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Saya Berutang (Utang)
          </button>
          <button
            type="button"
            onClick={() => setType('receivable')}
            className={cn(
              'py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
              type === 'receivable'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Orang Berutang (Piutang)
          </button>
        </div>
      </div>

      {/* Nama Pihak */}
      <Input
        label="Nama Pihak / Judul Catatan"
        value={personName}
        onChange={e => {
          setPersonName(e.target.value)
          if (errors.person_name) setErrors(prev => ({ ...prev, person_name: '' }))
        }}
        error={errors.person_name}
        placeholder={type === 'debt' ? 'Contoh: Beli Laptop, Pinjaman Modal, Budi Santoso' : 'Nama peminjam'}
      />

      {/* Kelompok / Tempat Pinjaman */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
          <Layers className="w-3.5 h-3.5 text-primary-500" />
          Kelompok / Tempat Pinjaman (Opsional)
        </label>
        <Input
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          placeholder="Contoh: Shopee Paylater, Bank BCA, Kredivo, Keluarga"
        />
        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {GROUP_SUGGESTIONS.map(sug => (
            <button
              key={sug}
              type="button"
              onClick={() => setGroupName(sug)}
              className={cn(
                'text-[11px] py-1 px-2.5 rounded-lg border transition-all cursor-pointer',
                groupName.toLowerCase() === sug.toLowerCase()
                  ? 'bg-primary-500 text-white border-primary-500 shadow-2xs font-semibold'
                  : 'bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Nominal Total"
        type="number"
        value={amount}
        onChange={e => {
          setAmount(e.target.value)
          if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }))
        }}
        error={errors.amount}
        placeholder="0"
      />

      {/* Skema Cicilan / Pinjaman Berjangka Toggle */}
      <div className="p-3.5 rounded-2xl bg-gray-50/90 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="is-installment-toggle" className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white cursor-pointer">
                Skema Cicilan Berjangka
              </label>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Untuk pinjol, paylater, kartu kredit, atau cicilan bulanan
              </p>
            </div>
          </div>
          <input
            id="is-installment-toggle"
            type="checkbox"
            checked={isInstallment}
            onChange={e => setIsInstallment(e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        {isInstallment && (
          <div className="space-y-3 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 animate-fade-in">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Tenor / Jumlah Bulan
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={installmentCount}
                  onChange={e => setInstallmentCount(e.target.value)}
                  placeholder="6"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Jatuh Tempo Setiap Tgl
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={installmentDueDay}
                  onChange={e => setInstallmentDueDay(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                Nominal Angsuran per Bulan (Rp)
              </label>
              <input
                type="number"
                value={installmentAmount}
                onChange={e => setInstallmentAmount(e.target.value)}
                placeholder="Contoh: 350000"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {installmentDueDay && installmentAmount && (
              <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  Jatuh tempo setiap <strong>tanggal {installmentDueDay}</strong> sebesar{' '}
                  <strong>{formatCurrency(parseInt(installmentAmount, 10) || 0)}</strong>/bulan (Tenor {parsedCount} bulan).
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Target Duration Picker (Presets, Custom Days/Weeks/Months, or Calendar) */}
      <DurationPicker
        deadline={dueDate}
        onChangeDeadline={setDueDate}
        label="Target Pelunasan Akhir (Opsional)"
        accentColor="rose"
      />

      {/* Live Auto-Calculator Breakdown */}
      {breakdown && !breakdown.isExpired && !isInstallment && (
        <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-rose-900 dark:text-rose-200 font-semibold">
            <span className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Target {type === 'debt' ? 'Cicilan Pelunasan' : 'Penagihan'} Otomatis
            </span>
            <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
              {breakdown.label}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-2xs border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Per Hari</p>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {formatCurrency(breakdown.perDay)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-2xs border border-gray-100 dark:border-gray-700">
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Per Minggu</p>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                {formatCurrency(breakdown.perWeek)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-2xs border border-rose-200 dark:border-rose-800/60">
              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Per Bulan</p>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-0.5">
                {formatCurrency(breakdown.perMonth)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Catatan (Opsional)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Keterangan keperluan utang/piutang..."
          rows={2}
          className="block w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Batal
        </Button>
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
