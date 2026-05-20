import { formatPrice } from '@/lib/utils'

type PurchaseSummaryProps = {
  totalAmountInCents: number
  installmentsEnabled: boolean
  installmentsCount: number
}

export function PurchaseSummary({
  totalAmountInCents,
  installmentsEnabled,
  installmentsCount,
}: PurchaseSummaryProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total da compra</span>
        <span className="font-semibold tabular-nums">{formatPrice(totalAmountInCents / 100)}</span>
      </div>

      {installmentsEnabled && installmentsCount > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Valor por parcela</span>
          <span className="font-semibold tabular-nums">
            {formatPrice(Math.round(totalAmountInCents / installmentsCount) / 100)}
            <span className="text-muted-foreground font-normal ml-1 text-xs">
              x{installmentsCount}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
