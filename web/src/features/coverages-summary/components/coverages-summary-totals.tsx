import { BanknoteArrowDown, BanknoteArrowUp, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { HiddenValue } from '@/components/ui/hidden-value'
import { formatPrice } from '@/lib/utils'

type CoveragesSummaryTotalsProps = {
  totalCovered: number
  totalRepaid: number
  totalRemaining: number
}

export function CoveragesSummaryTotals({
  totalCovered,
  totalRepaid,
  totalRemaining,
}: CoveragesSummaryTotalsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Coberto</span>
            <BanknoteArrowUp className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-start justify-end">
          <HiddenValue className="w-32 h-8">
            <span className="text-2xl text-amber-600 dark:text-amber-400">
              {formatPrice(totalCovered / 100)}
            </span>
          </HiddenValue>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Recebido</span>
            <BanknoteArrowDown className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-start justify-end">
          <HiddenValue className="w-32 h-8">
            <span className="text-2xl text-green-600 dark:text-green-400">
              {formatPrice(totalRepaid / 100)}
            </span>
          </HiddenValue>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Pendente</span>
            <Clock className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-start justify-end">
          <HiddenValue className="w-32 h-8">
            <span className="text-2xl text-destructive">{formatPrice(totalRemaining / 100)}</span>
          </HiddenValue>
        </CardContent>
      </Card>
    </div>
  )
}
