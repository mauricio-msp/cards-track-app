import { Calendar, CreditCard, Dot, Eye, EyeClosed, Landmark, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { HiddenValue } from '@/components/ui/hidden-value'
import { Progress } from '@/components/ui/progress'
import { UpdateCardForm } from '@/features/credit-card/components/forms'
import { ReconcileAnticipationsDialog } from '@/features/credit-card/components/reconcile-anticipations-dialog'
import { useCard, useTotalAmountUsedCard } from '@/features/credit-card/hooks'
import { creditCards } from '@/helpers/credit-cards'
import { MONTHS } from '@/helpers/months'
import { useHideValuesStore } from '@/hooks/store/use-hide-values-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatCompact, formatPrice } from '@/lib/utils'

export function Details({ cardId }: { cardId: string }) {
  const { hideValues, toggleHideValues } = useHideValuesStore()
  const isMobile = useIsMobile()
  const isDesktop = !isMobile

  const {
    data: { card },
  } = useCard(cardId)

  const {
    data: { totalAmountCard },
  } = useTotalAmountUsedCard(cardId)

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
          children: <Landmark className="text-white" />,
        })}

        <div className="flex flex-col gap-0.5">
          <p className="text-lg font-semibold">
            {currentCreditCard?.name}
            <UpdateCardForm card={{ id: cardId, ...card }}>
              <Button size="icon-xs" variant="outline" className="ml-2 cursor-pointer">
                <Pencil />
              </Button>
            </UpdateCardForm>
            <ReconcileAnticipationsDialog cardId={cardId} />
          </p>
          <span className="text-sm text-muted-foreground">
            {isDesktop && 'Competência: '}
            {MONTHS[competenceMonth]}/{competenceYear}
          </span>
        </div>

        <div className="ml-auto flex gap-1 self-start">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleHideValues}
            aria-label={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
          >
            {hideValues ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 mt-6 space-y-2">
        <div className="flex flex-col flex-start lg:flex-row lg:items-center justify-between">
          <span className="text-xs tracking-wide text-muted-foreground uppercase lg:normal-case lg:text-sm">
            Limite utilizado
          </span>
          <HiddenValue className="w-48 h-5">
            <span className="text-sm text-primary font-semibold">
              {isMobile
                ? `${formatCompact(totalAmountCard)} / ${formatCompact(card.limit)}`
                : `${formatPrice(totalAmountCard / 100)} / ${formatPrice(card.limit / 100)}`}
            </span>
          </HiddenValue>
        </div>
        <Progress
          value={(totalAmountCard / card.limit) * 100}
          aria-label={`Limite utilizado: ${formatPrice(totalAmountCard / 100)} de ${formatPrice(card.limit / 100)}`}
        />
      </CardContent>
      <CardFooter className="gap-1 justify-start md:justify-between">
        <div className="flex items-center gap-1 text-muted-foreground">
          {isDesktop && <Calendar className="size-4" />}
          <span className="text-sm">Fecha</span>
          <span className="text-sm text-primary font-semibold">
            {card.closingOffsetDays} dias antes
          </span>
        </div>
        {isMobile && <Dot className="size-6 text-muted-foreground" />}
        <div className="flex items-center gap-1 text-muted-foreground">
          {isDesktop && <CreditCard className="size-4" />}
          <span className="text-sm">Vence</span>
          <span className="text-sm text-primary font-semibold">dia {card.dueDay}</span>
        </div>
        <div />
      </CardFooter>
    </Card>
  )
}
