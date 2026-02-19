import { useSuspenseQuery } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { getMonthTotalDebtsAmount } from '@/api/get-month-total-debts-amount'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { formatPrice } from '@/helpers/format-price'

export function MonthTotalDebtsAmountCard() {
  const { data } = useSuspenseQuery({
    queryKey: ['month-total-debts-amount'],
    queryFn: getMonthTotalDebtsAmount,
    refetchOnWindowFocus: false,
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Dívida Total (mês)</span>
          <Wallet className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-start justify-end">
        <span className="text-2xl text-destructive">{formatPrice(data.totalAmount / 100)}</span>
        <span className="text-xs text-muted-foreground">
          Soma de todos os cartões ainda em aberto do mês
        </span>
      </CardContent>
    </Card>
  )
}
