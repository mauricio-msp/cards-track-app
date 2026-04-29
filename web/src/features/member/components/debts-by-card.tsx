import type { LucideIcon } from 'lucide-react'
import { BanknoteX, Dot, Sparkles, TriangleAlert, Zap } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { HiddenValue } from '@/components/ui/hidden-value'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Competence } from '@/features/credit-card/components/competence'
import { useMemberDebts } from '@/features/member/hooks/use-member-debts'
import { formatPrice } from '@/lib/utils'

type DebtItemProps = {
  id: string
  description: string
  purchaseDate: string
  amount: number
  installmentsCount: number
  installmentsAmount: number
  elapsedInstallments: number
  remainingInstallments: number
  anticipatedAt?: string | null
  anticipatedInstallmentsCount?: number | null
  anticipateFromInstallment?: number | null
}

type StatusBadge = {
  show: boolean
  className: string
  icon: LucideIcon
  label: string
}

function DebtItem({ debt }: { debt: DebtItemProps }) {
  const descRef = React.useRef<HTMLParagraphElement>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)

  React.useEffect(() => {
    const el = descRef.current
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth)
  }, [])

  const isAnticipated =
    !!debt.anticipatedAt && debt.elapsedInstallments === debt.anticipateFromInstallment
  const isComplete = debt.remainingInstallments === 0
  const hasRemainingAfterAnticipation = isAnticipated && debt.remainingInstallments > 0
  const isNewPurchase =
    !isAnticipated && debt.installmentsCount > 1 && debt.elapsedInstallments === 1
  const isLastPayment = isComplete && !isAnticipated

  const statusBadges: StatusBadge[] = [
    {
      show: isAnticipated,
      icon: Zap,
      label: hasRemainingAfterAnticipation ? 'Parcial' : 'Antecipado',
      className: 'shrink-0 gap-1 text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      show: isNewPurchase,
      icon: Sparkles,
      label: 'Nova',
      className: 'shrink-0 gap-1 text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
    },
    {
      show: isLastPayment,
      icon: TriangleAlert,
      label: 'Último',
      className: 'shrink-0 gap-1 text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400',
    },
  ]

  return (
    <div
      key={debt.id}
      className="py-4 px-2 flex gap-4 bg-background not-last:mb-2 rounded-xl border border-accent"
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <p ref={descRef} className="text-sm text-primary truncate">
                {debt.description}
              </p>
            </TooltipTrigger>
            {isTruncated && <TooltipContent side="top">{debt.description}</TooltipContent>}
          </Tooltip>
          {statusBadges
            .filter(b => b.show)
            .map(({ className, icon: Icon, label }) => (
              <Badge key={label} variant="outline" className={className}>
                <Icon className="size-3" />
                {label}
              </Badge>
            ))}
        </div>

        <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-x-0.5 gap-y-0">
          <span>
            {new Date(debt.purchaseDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
          </span>

          {debt.installmentsCount > 1 && (
            <>
              <Dot className="shrink-0" />
              {isAnticipated ? (
                <span className="whitespace-nowrap">
                  {debt.anticipatedInstallmentsCount}x consolidadas
                  {hasRemainingAfterAnticipation && ` · ${debt.remainingInstallments} restante(s)`}
                </span>
              ) : (
                <span className="whitespace-nowrap">
                  {debt.elapsedInstallments}/{debt.installmentsCount}x
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="ml-auto flex flex-col text-right gap-1 shrink-0">
        <HiddenValue className="w-20 h-5 dark:bg-muted-foreground/20">
          <p className="text-sm font-semibold">{formatPrice(debt.installmentsAmount / 100)}</p>
        </HiddenValue>
        <span className="text-xs text-muted-foreground">
          Total: <HiddenValue placeholder="****">{formatPrice(debt.amount / 100)}</HiddenValue>
        </span>
      </div>
    </div>
  )
}

export function DebtsByCard({ memberId }: { memberId: string }) {
  const {
    data: { cardsWithDebts },
  } = useMemberDebts(memberId)

  if (!cardsWithDebts.length) {
    return (
      <Empty className="px-2 py-4 border border-dashed md:p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BanknoteX />
          </EmptyMedia>
          <EmptyTitle>Não há dívidas ainda</EmptyTitle>
          <EmptyDescription>
            Você não registrou nenhuma <br /> despesa para este membro.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea className="w-full">
      <ScrollBar
        orientation="horizontal"
        className="top-0! bottom-auto! border-t-0 border-b border-b-transparent"
      />
      <div className="flex gap-4 py-3">
        {cardsWithDebts
          .sort((a, b) => a.card.dueDay - b.card.dueDay)
          .map((cwd, index) => (
            <Card key={index} className="w-md shrink-0 flex flex-col">
              <CardHeader className="flex items-center gap-2">
                <Competence
                  cardName={cwd.card.name}
                  targetMonth={cwd.card.targetMonth}
                  targetYear={cwd.card.targetYear}
                />
              </CardHeader>

              <CardContent className="flex-1">
                <Separator className="mb-4" />
                {cwd.debts
                  .sort(
                    (a, b) =>
                      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
                  )
                  .map(debt => (
                    <DebtItem key={debt.id} debt={debt} />
                  ))}
              </CardContent>

              <CardFooter className="border-t gap-4 justify-between">
                <div className="flex flex-col">
                  <span className="text-sm">Total da dívida</span>
                  <span className="text-xs text-muted-foreground">{cwd.card.name}</span>
                </div>
                <HiddenValue className="w-24 h-7 dark:bg-muted-foreground/20">
                  <span className="text-lg text-destructive font-semibold">
                    {formatPrice(
                      cwd.debts.reduce((sum, debt) => sum + debt.installmentsAmount, 0) / 100,
                    )}
                  </span>
                </HiddenValue>
              </CardFooter>
            </Card>
          ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
