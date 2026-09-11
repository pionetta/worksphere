import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 [background-image:linear-gradient(to_right,#6366F1,#8B5CF6)] text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] hover:brightness-105 active:scale-[0.98] focus-visible:ring-indigo-400',
  secondary:
    'bg-gray-100 dark:bg-[#1E232D] text-slate-800 dark:text-slate-100 border border-white/70 dark:border-white/5 shadow-[-4px_-4px_10px_rgba(255,255,255,0.9),4px_4px_10px_rgba(163,177,198,0.35)] dark:shadow-[-3px_-3px_8px_rgba(255,255,255,0.03),3px_3px_8px_rgba(0,0,0,0.5)] active:shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.9),inset_3px_3px_6px_rgba(163,177,198,0.35)] dark:active:shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.03),inset_3px_3px_6px_rgba(0,0,0,0.5)] active:scale-[0.98] focus-visible:ring-indigo-400',
  ghost:
    'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5 active:scale-[0.98] focus-visible:ring-indigo-400',
  danger:
    'bg-danger [background-image:linear-gradient(to_right,#F43F5E,#E11D48)] text-white shadow-[0_8px_20px_rgba(244,63,94,0.35)] hover:brightness-105 active:scale-[0.98] focus-visible:ring-rose-400',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl gap-1.5 min-h-[36px]',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2 min-h-[44px]',
  lg: 'px-6 py-3 text-base font-semibold rounded-2xl gap-2.5 min-h-[48px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-95 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
})
