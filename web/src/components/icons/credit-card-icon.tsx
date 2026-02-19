import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function CreditCardIcon({
  bg,
  className,
  ...props
}: ComponentProps<'div'> & { bg: string }) {
  return (
    <div style={{ background: bg }} className={cn('size-5 rounded-full', className)} {...props} />
  )
}
