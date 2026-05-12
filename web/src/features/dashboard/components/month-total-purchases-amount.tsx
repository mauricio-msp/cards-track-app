import { Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { HiddenValue } from '@/components/ui/hidden-value'
import { useMonthTotalPurchasesAmount } from '@/features/dashboard/hooks/use-month-total-purchases-amount'
import { formatPrice } from '@/lib/utils'

export function MonthTotalPurchasesAmountCard() {
  const { data } = useMonthTotalPurchasesAmount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Dívida Total (mês)</span>
          <Wallet className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-start justify-end">
        <HiddenValue className="w-32 h-8">
          <span className="text-2xl text-destructive">{formatPrice(data.totalAmount / 100)}</span>
        </HiddenValue>
        <span className="text-xs text-muted-foreground truncate w-full">
          Soma dos cartões em aberto do mês
        </span>
      </CardContent>
    </Card>
  )
}
