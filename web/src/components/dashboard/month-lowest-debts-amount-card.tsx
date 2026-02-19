import { useSuspenseQuery } from '@tanstack/react-query'
import { TrendingDown } from 'lucide-react'
import { getMonthLowestDebtsAmount } from '@/api/get-month-lowest-debts-amount'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatPrice } from '@/helpers/format-price'

export function MonthLowestDebtsAmountCard() {
  const { data } = useSuspenseQuery({
    queryKey: ['month-lowest-debts-amount'],
    queryFn: getMonthLowestDebtsAmount,
    refetchOnWindowFocus: false,
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Menor Dívida (mês)</span>
          <TrendingDown className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-start justify-end">
        <span className="text-2xl text-foreground">
          {data.cards.length ? (
            <span className="capitalize">{data.cards.map(card => card.cardName).join(' - ')}</span>
          ) : (
            'Sem cartões com dívidas'
          )}
        </span>
        <span className="text-xs text-destructive">{formatPrice(data.amount / 100)}</span>
      </CardContent>
    </Card>
  )
}
