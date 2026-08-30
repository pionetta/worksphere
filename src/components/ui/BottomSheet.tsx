import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function BottomSheet({ open, onClose, title, children, className }: BottomSheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Store previous focus on open
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [open])

  // Body scroll lock
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Focus trap
  useEffect(() => {
    if (!open) return
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const container = contentRef.current
      if (!container) return
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [open])

  // Initial focus
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => contentRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [open])

  // Return focus on close
  useEffect(() => {
    if (!open && previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Dialog'}
      onClick={e => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs" />
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          'relative w-full max-w-lg max-h-[88vh] flex flex-col',
          'bg-white dark:bg-gray-900 rounded-[24px] sm:rounded-[28px]',
          'shadow-2xl border border-gray-100 dark:border-gray-800/80 outline-none',
          'animate-scale-in',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800/80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-t-[24px] sm:rounded-t-[28px] shrink-0 z-10">
            <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-gray-100 truncate pr-2">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 pb-6">{children}</div>
      </div>
    </div>
  )
}
