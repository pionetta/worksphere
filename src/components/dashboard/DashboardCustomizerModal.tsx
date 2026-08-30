import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { ArrowUp, ArrowDown, Eye, EyeOff, RotateCcw, Check, Sparkles } from 'lucide-react'
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
      <div className="flex flex-col space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            Sesuaikan urutan modul dengan tombol panah dan pilih modul mana yang ingin ditampilkan pada halaman beranda dashboard Anda.
          </p>
        </div>

        {/* Scrollable Widget Cards List */}
        <div className="space-y-2.5 max-h-[50vh] sm:max-h-[55vh] overflow-y-auto pr-1">
          {widgets.map((w, index) => (
            <div
              key={w.id}
              className={cn(
                'flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 shadow-2xs',
                w.visible
                  ? 'bg-white dark:bg-gray-800/90 border-gray-200/80 dark:border-gray-700/80'
                  : 'bg-gray-50/70 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-800 opacity-60'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-[11px] font-black text-gray-500 dark:text-gray-400 flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                    {w.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {w.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Reorder Up Button */}
                <button
                  type="button"
                  onClick={() => onMoveWidget(index, index - 1)}
                  disabled={index === 0}
                  className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700/80 disabled:opacity-20 transition-all cursor-pointer"
                  title="Pindah ke atas"
                  aria-label="Pindah ke atas"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Reorder Down Button */}
                <button
                  type="button"
                  onClick={() => onMoveWidget(index, index + 1)}
                  disabled={index === widgets.length - 1}
                  className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700/80 disabled:opacity-20 transition-all cursor-pointer"
                  title="Pindah ke bawah"
                  aria-label="Pindah ke bawah"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Toggle Visibility Button */}
                <button
                  type="button"
                  onClick={() => onToggleWidget(w.id, !w.visible)}
                  className={cn(
                    'p-1.5 rounded-xl transition-all ml-0.5 cursor-pointer',
                    w.visible
                      ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50'
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

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onResetDefaults}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Reset Bawaan
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onClose}
            icon={<Check className="w-3.5 h-3.5" />}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Selesai
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
