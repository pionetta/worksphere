import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createDebtSchema } from '@/features/finance/schemas/debtSchema'
import { DurationPicker } from '@/features/finance/components/DurationPicker'
import { calculateTargetBreakdown } from '@/features/finance/utils/paymentCalculator'
import { formatCurrency } from '@/utils/currency'
import { Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DebtType } from '@/types'

interface DebtFormProps {
  initialType?: DebtType
  initialPersonName?: string
  initialAmount?: number
  initialDueDate?: string
  initialNote?: string
  onSubmit: (data: {
    type: DebtType
    person_name: string
    amount: number
    due_date?: string | null
    note?: string
  }) => Promise<void> | void
  onCancel: () => void
  submitLabel?: string
}

export function DebtForm({
  initialType = 'debt',
  initialPersonName = '',
  initialAmount,
  initialDueDate = '',
  initialNote = '',
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: DebtFormProps) {
  const [type, setType] = useState<DebtType>(initialType)
  const [personName, setPersonName] = useState(initialPersonName)
  const [amount, setAmount] = useState(initialAmount ? String(initialAmount) : '')
  const [dueDate, setDueDate] = useState(initialDueDate)
  const [note, setNote] = useState(initialNote)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const parsedAmount = useMemo(() => {
    const val = parseInt(amount, 10)
    return isNaN(val) ? 0 : val
  }, [amount])

  const breakdown = useMemo(() => {
    return calculateTargetBreakdown(parsedAmount, dueDate)
  }, [parsedAmount, dueDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = createDebtSchema.safeParse({
      type,
      person_name: personName,
      amount: parsedAmount,
      due_date: dueDate || null,
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
        amount: result.data.amount,
        due_date: result.data.due_date,
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

      <Input
        label="Nama Pihak / Orang"
        value={personName}
        onChange={e => {
          setPersonName(e.target.value)
          if (errors.person_name) setErrors(prev => ({ ...prev, person_name: '' }))
        }}
        error={errors.person_name}
        placeholder={type === 'debt' ? 'Nama pemberi pinjaman' : 'Nama peminjam'}
      />

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

      {/* Target Duration Picker (Presets, Custom Days/Weeks/Months, or Calendar) */}
      <DurationPicker
        deadline={dueDate}
        onChangeDeadline={setDueDate}
        label="Target Waktu Jatuh Tempo (Opsional)"
        accentColor="rose"
      />

      {/* Live Auto-Calculator Breakdown */}
      {breakdown && !breakdown.isExpired && (
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
