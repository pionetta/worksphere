import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Check } from 'lucide-react'
import type { DashboardWidgetConfig, DashboardWidgetId } from '@/hooks/useDashboardWidgets'
import { cn } from '@/lib/utils'

interface DashboardCustomizerModalProps {
  open: boolean
  onClose: () => void
  widgets: DashboardWidgetConfig[]
  onToggleWidget: (id: DashboardWidgetId, visible: boolean) => void
  onMoveWidget: (fromIndex: number, toIndex: number) => void
  onResetDefaults: () => void
}

export function DashboardCustomizerModal({
  open,
  onClose,
  widgets,
  onToggleWidget,
  onMoveWidget,
  onResetDefaults,
}: DashboardCustomizerModalProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Atur Tata Letak Dashboard">
      <div className="space-y-4 py-2 pb-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Ubah urutan widget dengan tombol panah dan aktifkan/nonaktifkan widget sesuai kebutuhan Anda.
        </p>

        <div className="space-y-2.5">
          {widgets.map((w, index) => (
            <div
              key={w.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-2xl border transition-all',
                w.visible
                  ? 'bg-white dark:bg-gray-800/90 border-gray-200/80 dark:border-gray-700/80 shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-800 opacity-60'
              )}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-400">#{index + 1}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                    {w.title}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {w.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* Reorder Buttons */}
                <button
                  type="button"
                  onClick={() => onMoveWidget(index, index - 1)}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                  aria-label="Pindah ke atas"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveWidget(index, index + 1)}
                  disabled={index === widgets.length - 1}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
                  aria-label="Pindah ke bawah"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Toggle Visibility Button */}
                <button
                  type="button"
                  onClick={() => onToggleWidget(w.id, !w.visible)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors ml-1',
                    w.visible
                      ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-gray-800'
                  )}
                  title={w.visible ? 'Sembunyikan Widget' : 'Tampilkan Widget'}
                >
                  {w.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onResetDefaults}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Bawaan
          </Button>

          <Button type="button" size="sm" onClick={onClose} icon={<Check className="w-3.5 h-3.5" />}>
            Selesai
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
