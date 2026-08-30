import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createDebtSchema } from '@/features/finance/schemas/debtSchema'
import { DurationPicker } from '@/features/finance/components/DurationPicker'
import { calculateTargetBreakdown } from '@/features/finance/utils/paymentCalculator'
import { formatCurrency } from '@/utils/currency'
import { Calculator, CreditCard, Layers, RefreshCw, CheckCircle2, SlidersHorizontal, Sparkles } from 'lucide-react'
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
  initialIsFlexibleInstallment?: boolean
  initialInstallmentCount?: number | null
  initialInstallmentPaidCount?: number | null
  initialInstallmentAmount?: number | null
  initialInstallmentSchedule?: number[] | null
  initialCurrentBillAmount?: number | null
  initialInstallmentDueDay?: number | null
  onSubmit: (data: {
    type: DebtType
    person_name: string
    group_name?: string | null
    amount: number
    due_date?: string | null
    is_installment?: boolean
    is_flexible_installment?: boolean
    installment_count?: number | null
    installment_paid_count?: number | null
    installment_amount?: number | null
    installment_schedule?: number[] | null
    current_bill_amount?: number | null
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
  initialIsFlexibleInstallment = false,
  initialInstallmentCount = null,
  initialInstallmentPaidCount = null,
  initialInstallmentAmount = null,
  initialInstallmentSchedule = null,
  initialCurrentBillAmount = null,
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
  const [isFlexible, setIsFlexible] = useState(initialIsFlexibleInstallment)
  const [installmentCount, setInstallmentCount] = useState<string>(
    initialInstallmentCount ? String(initialInstallmentCount) : '6'
  )
  const [installmentPaidCount, setInstallmentPaidCount] = useState<string>(
    initialInstallmentPaidCount !== null && initialInstallmentPaidCount !== undefined
      ? String(initialInstallmentPaidCount)
      : '0'
  )
  const [installmentAmount, setInstallmentAmount] = useState<string>(
    initialInstallmentAmount ? String(initialInstallmentAmount) : ''
  )
  const [currentBillAmount, setCurrentBillAmount] = useState<string>(
    initialCurrentBillAmount ? String(initialCurrentBillAmount) : ''
  )
  const [installmentDueDay, setInstallmentDueDay] = useState<string>(
    initialInstallmentDueDay ? String(initialInstallmentDueDay) : '10'
  )

  // Custom Monthly Installment Schedule (e.g. Bulan 1: 100k, Bulan 2: 150k, ...)
  const [isCustomSchedule, setIsCustomSchedule] = useState(
    Boolean(initialInstallmentSchedule && initialInstallmentSchedule.length > 0)
  )
  const [schedules, setSchedules] = useState<string[]>(() => {
    if (initialInstallmentSchedule && initialInstallmentSchedule.length > 0) {
      return initialInstallmentSchedule.map(String)
    }
    const count = initialInstallmentCount || 6
    const defAmount = initialInstallmentAmount ? String(initialInstallmentAmount) : ''
    return Array(count).fill(defAmount)
  })

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

  // Synchronize schedules array size with parsedCount
  useEffect(() => {
    setSchedules(prev => {
      if (prev.length === parsedCount) return prev
      if (prev.length < parsedCount) {
        const added = Array(parsedCount - prev.length).fill('')
        return [...prev, ...added]
      }
      return prev.slice(0, parsedCount)
    })
  }, [parsedCount])

  const parsedPaidCount = useMemo(() => {
    const val = parseInt(installmentPaidCount, 10)
    return isNaN(val) || val < 0 ? 0 : Math.min(parsedCount, val)
  }, [installmentPaidCount, parsedCount])

  const remainingTenor = useMemo(() => {
    return Math.max(0, parsedCount - parsedPaidCount)
  }, [parsedCount, parsedPaidCount])

  // Calculate sum of custom schedules
  const scheduleSum = useMemo(() => {
    return schedules.reduce((acc, s) => {
      const v = parseInt(s, 10)
      return acc + (isNaN(v) ? 0 : v)
    }, 0)
  }, [schedules])

  // Auto-fill total amount if custom schedule sum is valid and user modifies schedule
  const handleScheduleChange = (index: number, val: string) => {
    setSchedules(prev => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  // Quick action: Distribute total amount equally across all months
  const handleDistributeEqually = () => {
    if (parsedAmount <= 0) return
    const perMonth = Math.round(parsedAmount / parsedCount)
    setSchedules(Array(parsedCount).fill(String(perMonth)))
    setInstallmentAmount(String(perMonth))
  }

  // Auto-fill installment amount if empty and total amount is provided (for fixed flat installment)
  useEffect(() => {
    if (isInstallment && parsedAmount > 0 && !installmentAmount && !isFlexible && !isCustomSchedule) {
      const perMonth = Math.ceil(parsedAmount / parsedCount)
      setInstallmentAmount(String(perMonth))
    }
  }, [isInstallment, isFlexible, isCustomSchedule, parsedAmount, parsedCount, installmentAmount])

  // Calculate estimated already-paid amount from installment_paid_count
  const estimatedPaidAmount = useMemo(() => {
    if (!isInstallment || parsedPaidCount <= 0) return 0
    if (isCustomSchedule && schedules.length > 0) {
      let sum = 0
      for (let i = 0; i < Math.min(parsedPaidCount, schedules.length); i++) {
        const v = parseInt(schedules[i], 10)
        sum += isNaN(v) ? 0 : v
      }
      return sum
    }
    const instAmt = parseInt(installmentAmount, 10)
    if (!isNaN(instAmt) && instAmt > 0) {
      return Math.min(parsedAmount || instAmt * parsedCount, parsedPaidCount * instAmt)
    }
    if (parsedAmount > 0 && parsedCount > 0) {
      const perMonth = Math.round(parsedAmount / parsedCount)
      return Math.min(parsedAmount, parsedPaidCount * perMonth)
    }
    return 0
  }, [isInstallment, parsedPaidCount, isCustomSchedule, schedules, installmentAmount, parsedAmount, parsedCount])

  const breakdown = useMemo(() => {
    return calculateTargetBreakdown(parsedAmount, dueDate)
  }, [parsedAmount, dueDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedDueDay = parseInt(installmentDueDay, 10)
    const parsedInstAmount = parseInt(installmentAmount, 10)
    const parsedBillAmount = parseInt(currentBillAmount, 10)

    // Final total amount: if custom schedule is active and has sum > 0, use scheduleSum unless amount is explicitly higher
    const finalAmount = isInstallment && isCustomSchedule && scheduleSum > 0 ? scheduleSum : parsedAmount

    const parsedScheduleNumbers = isInstallment && isCustomSchedule
      ? schedules.map(s => {
          const v = parseInt(s, 10)
          return isNaN(v) ? 0 : v
        })
      : null

    const result = createDebtSchema.safeParse({
      type,
      person_name: personName,
      group_name: groupName.trim() || null,
      amount: finalAmount,
      due_date: dueDate || null,
      is_installment: isInstallment,
      is_flexible_installment: isInstallment ? isFlexible : false,
      installment_count: isInstallment ? parsedCount : null,
      installment_paid_count: isInstallment ? parsedPaidCount : null,
      installment_amount: isInstallment && !isNaN(parsedInstAmount) ? parsedInstAmount : null,
      installment_schedule: parsedScheduleNumbers,
      current_bill_amount: isInstallment && !isNaN(parsedBillAmount) ? parsedBillAmount : null,
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
        is_flexible_installment: result.data.is_flexible_installment,
        installment_count: result.data.installment_count,
        installment_paid_count: result.data.installment_paid_count,
        installment_amount: result.data.installment_amount,
        installment_schedule: result.data.installment_schedule,
        current_bill_amount: result.data.current_bill_amount,
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
        label={
          isInstallment && isCustomSchedule && scheduleSum > 0
            ? `Nominal Total Tagihan (Otomatis: ${formatCurrency(scheduleSum)})`
            : 'Nominal Total Tagihan / Limit Terpakai'
        }
        type="number"
        value={isInstallment && isCustomSchedule && scheduleSum > 0 ? String(scheduleSum) : amount}
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
                Skema Cicilan / Paylater
              </label>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Fitur angsuran, cicilan per bulan kustom, dan jatuh tempo
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
            {/* Model Tagihan: Tetap vs Fleksibel / Paylater */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setIsFlexible(false)}
                className={cn(
                  'py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer',
                  !isFlexible
                    ? 'bg-indigo-500 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                Cicilan Tetap
              </button>
              <button
                type="button"
                onClick={() => setIsFlexible(true)}
                className={cn(
                  'py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1',
                  isFlexible
                    ? 'bg-indigo-500 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <RefreshCw className="w-3 h-3" />
                Paylater (Fleksibel)
              </button>
            </div>

            {/* Tenor & Jatuh Tempo */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Total Tenor (Jumlah Bulan)
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

            {/* Angsuran Selesai */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Angsuran yang Sudah Selesai
                </label>
                <input
                  type="number"
                  min="0"
                  max={parsedCount}
                  value={installmentPaidCount}
                  onChange={e => setInstallmentPaidCount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {isFlexible ? 'Tagihan Bulan Ini (Rp)' : 'Angsuran Standar / Bln'}
                </label>
                <input
                  type="number"
                  value={isFlexible ? currentBillAmount : installmentAmount}
                  onChange={e => {
                    if (isFlexible) {
                      setCurrentBillAmount(e.target.value)
                    } else {
                      setInstallmentAmount(e.target.value)
                    }
                  }}
                  placeholder={isFlexible ? 'Contoh: 450000' : 'Contoh: 350000'}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Calculated Initial Paid Summary Callout */}
            {parsedPaidCount > 0 && (
              <div className="p-2.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between animate-fade-in">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>
                    <strong>{parsedPaidCount}x angsuran</strong> sudah lunas ({formatCurrency(estimatedPaidAmount)})
                  </span>
                </span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 shrink-0 ml-2">
                  Sisa: {formatCurrency(Math.max(0, (parsedAmount || (parseInt(installmentAmount, 10) * parsedCount) || 0) - estimatedPaidAmount))}
                </span>
              </div>
            )}

            {/* Pilihan Rincian Cicilan: Bagi Rata vs Kustom per Bulan */}
            <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                  Rincian Nominal Angsuran per Bulan:
                </span>
                <div className="flex items-center p-0.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setIsCustomSchedule(false)}
                    className={cn(
                      'py-1 px-2 rounded-md font-semibold cursor-pointer transition-all',
                      !isCustomSchedule
                        ? 'bg-indigo-500 text-white shadow-2xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    )}
                  >
                    Bagi Rata
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSchedule(true)
                      if (schedules.every(s => !s) && parsedAmount > 0) {
                        handleDistributeEqually()
                      }
                    }}
                    className={cn(
                      'py-1 px-2 rounded-md font-semibold cursor-pointer transition-all',
                      isCustomSchedule
                        ? 'bg-indigo-500 text-white shadow-2xs'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    )}
                  >
                    Kustom Tiap Bulan
                  </button>
                </div>
              </div>

              {/* Custom Per-Month Schedule Inputs */}
              {isCustomSchedule ? (
                <div className="p-3 rounded-xl bg-white dark:bg-gray-900/90 border border-indigo-200 dark:border-indigo-800 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Masukkan nominal berbeda untuk tiap bulan:
                    </p>
                    {parsedAmount > 0 && (
                      <button
                        type="button"
                        onClick={handleDistributeEqually}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        Bagi Rata Otomatis
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {Array.from({ length: parsedCount }).map((_, idx) => {
                      const monthNum = idx + 1
                      const isCompleted = monthNum <= parsedPaidCount
                      return (
                        <div
                          key={monthNum}
                          className={cn(
                            'p-2 rounded-lg border text-xs space-y-1',
                            isCompleted
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                              : 'bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700'
                          )}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-gray-700 dark:text-gray-300">
                              Bulan {monthNum}
                            </span>
                            {isCompleted && (
                              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                ✓ Lunas
                              </span>
                            )}
                          </div>
                          <input
                            type="number"
                            value={schedules[idx] ?? ''}
                            onChange={e => handleScheduleChange(idx, e.target.value)}
                            placeholder="0"
                            className="w-full px-2 py-1 text-xs rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-semibold"
                          />
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Total Akumulasi:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(scheduleSum)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Live Installment Status Card */}
            <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 space-y-1.5 text-xs text-indigo-900 dark:text-indigo-200">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Status: {parsedPaidCount} / {parsedCount} Angsuran Selesai
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  Sisa {remainingTenor}x lagi
                </span>
              </div>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                {isCustomSchedule
                  ? `Jatuh tempo setiap tgl ${installmentDueDay || 10} • Nominal mengikuti rincian kustom tiap bulan.`
                  : isFlexible
                  ? `Tagihan bulan ini: ${formatCurrency(parseInt(currentBillAmount, 10) || 0)} (Jatuh tempo setiap tgl ${installmentDueDay || 10})`
                  : `Angsuran tetap: ${formatCurrency(parseInt(installmentAmount, 10) || 0)}/bulan (Jatuh tempo setiap tgl ${installmentDueDay || 10})`}
              </p>
            </div>
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
