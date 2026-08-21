import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  success: 'bg-success-light text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-warning-light text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-danger-light text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-info-light text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
