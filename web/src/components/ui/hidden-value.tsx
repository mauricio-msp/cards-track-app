import { useHideValuesStore } from '@/hooks/store/use-hide-values-store'
import { cn } from '@/lib/utils'

interface HiddenValueProps {
  children: React.ReactNode
  /** Inline text shown when hidden (e.g. "****"). When provided, `className` has no effect. */
  placeholder?: string
  /** Width/height classes for the block placeholder. Only used when `placeholder` is not set. */
  className?: string
}

/**
 * Masks its children when hideValues is enabled.
 * - Without `placeholder`: renders a block element with the given `className` dimensions.
 * - With `placeholder`: renders the placeholder node inline (e.g. "****").
 */
export function HiddenValue({ children, placeholder, className }: HiddenValueProps) {
  const { hideValues } = useHideValuesStore()

  if (!hideValues) return <>{children}</>

  return (
    <>
      <span className="sr-only">{children}</span>
      {placeholder !== undefined ? (
        <span aria-hidden="true">{placeholder}</span>
      ) : (
        <span
          aria-hidden="true"
          className={cn('dark:bg-background/40 bg-muted rounded-sm inline-block', className)}
        />
      )}
    </>
  )
}
