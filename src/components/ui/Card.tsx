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
        'rounded-xl border transition-all duration-200',
        glass ? 'glass' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
