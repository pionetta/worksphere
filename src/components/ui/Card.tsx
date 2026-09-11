import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glass?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({ children, glass = false, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[28px] transition-all duration-200',
        glass
          ? 'glass bg-white/70 dark:bg-[#1E232D] shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)] border border-white/70 dark:border-white/5'
          : 'bg-white dark:bg-[#1E232D] border border-white/70 dark:border-white/5 shadow-[-8px_-8px_16px_rgba(255,255,255,0.9),8px_8px_16px_rgba(163,177,198,0.35)] dark:shadow-[-6px_-6px_14px_rgba(255,255,255,0.03),6px_6px_14px_rgba(0,0,0,0.5)]',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
