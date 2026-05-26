import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

function Root({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1', className)}>{children}</div>
  )
}

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('shrink-0 [&>svg]:size-5 [&>svg]:text-muted-foreground', className)}>
      {children}
    </span>
  )
}

function Title({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn('flex-1 text-2xl font-semibold tracking-tight', className)}>{children}</h1>
  )
}

function Description({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('basis-full order-last text-sm text-muted-foreground', className)}>
      {children}
    </p>
  )
}

function Action({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('shrink-0 flex items-center gap-2', className)}>{children}</div>
}

export const PageHeader = Object.assign(Root, { Icon, Title, Description, Action })
