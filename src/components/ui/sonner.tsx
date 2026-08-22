import { CheckCircle2, Info, Loader2, AlertCircle, AlertTriangle } from 'lucide-react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '@/hooks/useTheme'

export const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme === 'system' ? undefined : theme}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      icons={{
        success: <CheckCircle2 className="w-4 h-4 text-success" />,
        info: <Info className="w-4 h-4 text-info" />,
        warning: <AlertTriangle className="w-4 h-4 text-warning" />,
        error: <AlertCircle className="w-4 h-4 text-danger" />,
        loading: <Loader2 className="w-4 h-4 animate-spin text-primary-500" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface group-[.toaster]:text-text group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:font-sans',
          description: 'group-[.toast]:text-text-secondary text-xs',
          actionButton: 'group-[.toast]:bg-primary-500 group-[.toast]:text-white font-medium',
          cancelButton: 'group-[.toast]:bg-surface-2 group-[.toast]:text-text-secondary',
        },
      }}
      {...props}
    />
  )
}
