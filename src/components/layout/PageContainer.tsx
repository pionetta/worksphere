import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageContainerProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function PageContainer({ children, className, noPadding = false }: PageContainerProps) {
  return (
    <main
      className={cn('flex-1 overflow-y-auto', !noPadding && 'px-4 py-4 pb-20 md:pb-4', className)}
    >
      {children}
    </main>
  )
}
