import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DurationPicker } from '@/features/finance/components/DurationPicker'
import { calculateTargetBreakdown } from '@/features/finance/utils/paymentCalculator'
import { formatCurrency } from '@/utils/currency'
import { Calculator } from 'lucide-react'

interface SavingsGoalFormProps {
  initialName?: string
  initialTarget?: number
  initialDeadline?: string
  initialNote?: string
  onSubmit: (
    name: string,
    target: number,
    deadline: string | null,
    note: string | null
  ) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function SavingsGoalForm({
  initialName = '',
  initialTarget,
  initialDeadline = '',
  initialNote = '',
  onSubmit,
  onCancel,
  submitLabel = 'Simpan',
}: SavingsGoalFormProps) {
  const [name, setName] = useState(initialName)
  const [target, setTarget] = useState(initialTarget ? String(initialTarget) : '')
  const [deadline, setDeadline] = useState(initialDeadline)
  const [note, setNote] = useState(initialNote)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const parsedTarget = useMemo(() => {
    const val = parseInt(target.replace(/[^\d]/g, ''), 10)
    return isNaN(val) ? 0 : val
  }, [target])

  const breakdown = useMemo(() => {
    return calculateTargetBreakdown(parsedTarget, deadline)
  }, [parsedTarget, deadline])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Nama tujuan tabungan wajib diisi.')
      return
    }
    if (!parsedTarget || parsedTarget <= 0) {
      setError('Target tabungan harus lebih dari 0.')
      return
    }
    setLoading(true)
    try {
      await onSubmit(name.trim(), parsedTarget, deadline || null, note.trim() || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Input
        label="Nama Tujuan"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Contoh: Dana Darurat, Liburan, Beli Gadget"
        error={error}
        autoFocus
      />
      <Input
        label="Target Tabungan"
        type="number"
        value={target}
        onChange={e => setTarget(e.target.value)}
        placeholder="0"
      />

      {/* Target Duration Picker (Presets, Custom Days/Weeks/Months, or Calendar) */}
      <DurationPicker
        deadline={deadline}
        onChangeDeadline={setDeadline}
        label="Target Waktu / Deadline (Opsional)"
        accentColor="blue"
      />

      {/* Live Auto-Calculator Breakdown */}
      {breakdown && !breakdown.isExpired && (
        <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 font-semibold">
            <span className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Target Menabung Otomatis
            </span>
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">
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
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-2xs border border-blue-200 dark:border-blue-800/60">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Per Bulan</p>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                {formatCurrency(breakdown.perMonth)}
              </p>
            </div>
          </div>
        </div>
      )}

      <Input
        label="Catatan (opsional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Keterangan tujuan tabungan"
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

