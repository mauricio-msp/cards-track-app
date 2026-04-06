import { BadgeDollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HiddenValue } from '@/components/ui/hidden-value'
import { useCardDebts, useMonthTotalAmountCard } from '@/features/credit-card/hooks'
import { formatPrice } from '@/lib/utils'

export function TotalAmount({ cardId }: { cardId: string }) {
  const {
    data: { totalAmountMonth },
  } = useMonthTotalAmountCard(cardId)

  const {
    data: { debts },
  } = useCardDebts(cardId)

  return (
    <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeDollarSign />
          Total da Fatura
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col mt-6 space-y-2">
        <HiddenValue className="w-40 h-9">
          <span className="text-3xl text-destructive font-bold">
            {formatPrice(totalAmountMonth / 100)}
          </span>
        </HiddenValue>
        <span className="text-sm text-muted-foreground">
          {debts.length} despesa(s) registrada(s)
        </span>
      </CardContent>
    </Card>
  )
}
