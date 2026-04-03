import { Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useTotalDebtsAmount } from '@/features/dashboard/hooks/use-total-debts-amount'
import { formatPrice } from '@/lib/utils'

export function TotalDebtsAmountCard() {
  const { data } = useTotalDebtsAmount()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Dívida Total</span>
          <Wallet className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-start justify-end">
        <span className="text-2xl text-destructive">{formatPrice(data.totalAmount / 100)}</span>
        <span className="text-xs text-muted-foreground">Soma de todos os cartões</span>
      </CardContent>
    </Card>
  )
}
