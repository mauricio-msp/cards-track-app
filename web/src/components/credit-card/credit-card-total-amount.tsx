import { useSuspenseQuery } from '@tanstack/react-query'

import { BadgeDollarSign } from 'lucide-react'
import { getCardDebts } from '@/api/get-card-debts'
import { getMonthTotalAmountCard } from '@/api/get-month-total-amount-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/helpers/format-price'
import { useFilterDebts } from '@/hooks/store/use-filter-debts-store'

export function CreditCardTotalAmount({ cardId }: { cardId: string }) {
  const { month, year } = useFilterDebts()

  const {
    data: { totalAmountMonth },
  } = useSuspenseQuery({
    queryKey: ['cards', cardId, 'month', 'total', 'amount', month, year],
    queryFn: () => getMonthTotalAmountCard({ id: cardId, month, year }),
  })

  const {
    data: { debts },
  } = useSuspenseQuery({
    queryKey: ['cards', cardId, 'debts', month, year],
    queryFn: () => getCardDebts({ id: cardId, month, year }),
    refetchOnWindowFocus: false,
  })

  return (
    <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeDollarSign />
          Total da Fatura
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col mt-6 space-y-2">
        <span className="text-3xl text-destructive font-bold">
          {formatPrice(totalAmountMonth / 100)}
        </span>
        <span className="text-sm text-muted-foreground">
          {debts.length} despesa(s) registrada(s)
        </span>
      </CardContent>
    </Card>
  )
}
