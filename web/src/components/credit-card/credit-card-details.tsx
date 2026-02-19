import { useSuspenseQuery } from '@tanstack/react-query'

import { Calendar, CreditCard, Landmark } from 'lucide-react'

import { getCard } from '@/api/get-card'
import { getTotalAmountCard } from '@/api/get-total-amount-card'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { creditCards } from '@/helpers/credit-cards'
import { formatPrice } from '@/helpers/format-price'
import { MONTHS } from '@/helpers/months'

export function CreditCardDetails({ cardId }: { cardId: string }) {
  const {
    data: { card },
  } = useSuspenseQuery({
    queryKey: ['cards', cardId],
    queryFn: () => getCard({ id: cardId }),
    refetchOnWindowFocus: false,
  })

  const {
    data: { totalAmountCard },
  } = useSuspenseQuery({
    queryKey: ['cards', cardId, 'total', 'amount'],
    queryFn: () => getTotalAmountCard({ id: cardId }),
    refetchOnWindowFocus: false,
  })

  const currentCreditCard = creditCards.find(cc => cc.name.toLowerCase() === card.name)

  const today = new Date()
  const competenceMonth =
    today.getDate() > card.dueDay
      ? today.getMonth() + 1 > 11
        ? 0
        : today.getMonth() + 1
      : today.getMonth()
  const competenceYear =
    today.getDate() > card.dueDay
      ? today.getMonth() === 11
        ? today.getFullYear() + 1
        : today.getFullYear()
      : today.getFullYear()

  return (
    <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
      <CardHeader className="flex items-center gap-2">
        {currentCreditCard?.icon({
          className: 'size-12 rounded-xl grid place-items-center',
          children: <Landmark className="text-primary" />,
        })}
        <div className="flex flex-col gap-0.5">
          <p className="text-lg font-semibold">{currentCreditCard?.name}</p>
          <span className="text-sm text-muted-foreground">
            Competência: {MONTHS[competenceMonth]}/{competenceYear}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 mt-6 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Limite utilizado</span>
          <span className="text-sm text-primary font-semibold">
            {formatPrice(totalAmountCard / 100)} de {formatPrice(card.limit / 100)}
          </span>
        </div>
        <Progress value={((totalAmountCard / 100) * 100) / (card.limit / 100)} />
      </CardContent>
      <CardFooter className="justify-between">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="size-4" />
          <span className="text-sm">Fecha:</span>
          <span className="text-sm text-primary font-semibold">
            {card.closingOffsetDays} dias antes
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <CreditCard className="size-4" />
          <span className="text-sm">Vence:</span>
          <span className="text-sm text-primary font-semibold">Dia {card.dueDay}</span>
        </div>
        <div />
      </CardFooter>
    </Card>
  )
}
