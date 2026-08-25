import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export type TimeUnit = 'days' | 'weeks' | 'months'

interface DurationPickerProps {
  deadline: string
  onChangeDeadline: (dateStr: string) => void
  label?: string
  accentColor?: 'blue' | 'rose'
}

export function DurationPicker({
  deadline,
  onChangeDeadline,
  label = 'Target Waktu / Deadline (Opsional)',
  accentColor = 'blue',
}: DurationPickerProps) {
  const [mode, setMode] = useState<'preset' | 'custom' | 'date'>('preset')
  const [customValue, setCustomValue] = useState<string>('')
  const [customUnit, setCustomUnit] = useState<TimeUnit>('months')

  const applyCustomDuration = (valStr: string, unit: TimeUnit) => {
    const num = parseInt(valStr, 10)
    if (isNaN(num) || num <= 0) return
    const d = new Date()
    if (unit === 'days') {
      d.setDate(d.getDate() + num)
    } else if (unit === 'weeks') {
      d.setDate(d.getDate() + num * 7)
    } else if (unit === 'months') {
      d.setMonth(d.getMonth() + num)
    }
    onChangeDeadline(d.toISOString().split('T')[0])
  }

  const applyPresetMonths = (months: number) => {
    const d = new Date()
    d.setMonth(d.getMonth() + months)
    onChangeDeadline(d.toISOString().split('T')[0])
  }

  const handleCustomValueChange = (val: string) => {
    setCustomValue(val)
    applyCustomDuration(val, customUnit)
  }

  const handleCustomUnitChange = (unit: TimeUnit) => {
    setCustomUnit(unit)
    if (customValue) {
      applyCustomDuration(customValue, unit)
    }
  }

  const activeColor =
    accentColor === 'rose'
      ? 'bg-rose-500 text-white shadow-xs'
      : 'bg-[#2563EB] text-white shadow-xs'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={cn(
              'px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer',
              mode === 'preset'
                ? activeColor
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Pilihan
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={cn(
              'px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer',
              mode === 'custom'
                ? activeColor
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Kustom
          </button>
          <button
            type="button"
            onClick={() => setMode('date')}
            className={cn(
              'px-2 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer',
              mode === 'date'
                ? activeColor
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Kalender
          </button>
        </div>
      </div>

      {mode === 'preset' && (
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: '1 Bln', months: 1 },
            { label: '3 Bln', months: 3 },
            { label: '6 Bln', months: 6 },
            { label: '12 Bln', months: 12 },
          ].map(p => (
            <button
              key={p.months}
              type="button"
              onClick={() => applyPresetMonths(p.months)}
              className="py-1 px-2 text-[11px] font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors cursor-pointer text-center active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {mode === 'custom' && (
        <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2 animate-fade-in">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              value={customValue}
              onChange={e => handleCustomValueChange(e.target.value)}
              placeholder="Misal: 45"
              className="w-2/5 px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <div className="w-3/5 grid grid-cols-3 gap-1">
              {(['days', 'weeks', 'months'] as const).map(u => {
                const isSelected = customUnit === u
                const labelMap = { days: 'Hari', weeks: 'Minggu', months: 'Bulan' }
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleCustomUnitChange(u)}
                    className={cn(
                      'py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center truncate',
                      isSelected
                        ? activeColor
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    )}
                  >
                    {labelMap[u]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Direct Calendar Date Input */}
      <Input
        type="date"
        value={deadline}
        onChange={e => onChangeDeadline(e.target.value)}
        className="mt-1 text-xs"
      />
    </div>
  )
}
