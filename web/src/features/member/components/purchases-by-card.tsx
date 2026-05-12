import type { LucideIcon } from 'lucide-react'
import { BanknoteX, Dot, Sparkles, TriangleAlert, Zap } from 'lucide-react'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { HiddenValue } from '@/components/ui/hidden-value'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Competence } from '@/features/credit-card/components/competence'
import { useMemberPurchases } from '@/features/member/hooks/use-member-purchases'
import { cn, formatPrice } from '@/lib/utils'

type PurchaseItemProps = {
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

function PurchaseItem({ purchase }: { purchase: PurchaseItemProps }) {
  const descRef = React.useRef<HTMLParagraphElement>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)

  React.useEffect(() => {
    const el = descRef.current
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth)
  }, [])

  const isAnticipated =
    !!purchase.anticipatedAt && purchase.elapsedInstallments === purchase.anticipateFromInstallment
  const isComplete = purchase.remainingInstallments === 0
  const hasRemainingAfterAnticipation = isAnticipated && purchase.remainingInstallments > 0
  const isNewPurchase =
    !isAnticipated && purchase.installmentsCount > 1 && purchase.elapsedInstallments === 1
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
      key={purchase.id}
      className="py-4 px-2 flex gap-4 bg-background not-last:mb-2 rounded-xl border border-accent"
    >
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <p ref={descRef} className="text-sm text-primary truncate">
                {purchase.description}
              </p>
            </TooltipTrigger>
            {isTruncated && <TooltipContent side="top">{purchase.description}</TooltipContent>}
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
            {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
          </span>

          {purchase.installmentsCount > 1 && (
            <>
              <Dot className="shrink-0" />
              {isAnticipated ? (
                <span className="whitespace-nowrap">
                  {purchase.anticipatedInstallmentsCount}x consolidadas
                  {hasRemainingAfterAnticipation && ` · ${purchase.remainingInstallments} restante(s)`}
                </span>
              ) : (
                <span className="whitespace-nowrap">
                  {purchase.elapsedInstallments}/{purchase.installmentsCount}x
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="ml-auto flex flex-col text-right gap-1 shrink-0">
        <HiddenValue className="w-20 h-5 dark:bg-muted-foreground/20">
          <p className="text-sm font-semibold">{formatPrice(purchase.installmentsAmount / 100)}</p>
        </HiddenValue>
        <span className="text-xs text-muted-foreground">
          Total: <HiddenValue placeholder="****">{formatPrice(purchase.amount / 100)}</HiddenValue>
        </span>
      </div>
    </div>
  )
}

export function PurchasesByCard({ memberId }: { memberId: string }) {
  const {
    data: { cardsWithPurchases },
  } = useMemberPurchases(memberId)

  if (!cardsWithPurchases.length) {
    return (
      <Empty className="px-2 py-4 border border-dashed md:p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BanknoteX />
          </EmptyMedia>
          <EmptyTitle>Não há compras ainda</EmptyTitle>
          <EmptyDescription>
            Você não registrou nenhuma <br /> despesa para este membro.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea
      type="auto"
      className="flex-1 min-h-0 -mx-4 sm:mx-0"
      viewportClassName={cn(
        '[&>div]:h-full [&>div]:![display:unset]',
        'px-4 scroll-px-4 lg:px-0 lg:scroll-px-0 snap-x snap-mandatory lg:snap-none',
      )}
    >
      <div className="flex gap-4 py-3 h-full after:content-[''] after:block after:w-4 after:shrink-0 lg:after:hidden">
        {cardsWithPurchases
          .sort((a, b) => a.card.dueDay - b.card.dueDay)
          .map((cwd, index) => (
            <Card key={index} className="w-md shrink-0 flex flex-col h-full gap-0">
              <CardHeader className="flex items-center gap-2 shrink-0 border-b">
                <Competence
                  cardName={cwd.card.name}
                  targetMonth={cwd.card.targetMonth}
                  targetYear={cwd.card.targetYear}
                />
              </CardHeader>

              <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea
                  className="size-full"
                  viewportClassName="[&>div]:![display:unset]"
                >
                  <div className="px-4 py-4 w-full">
                    {cwd.purchases
                      .sort(
                        (a, b) =>
                          new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(),
                      )
                      .map(purchase => (
                        <PurchaseItem key={purchase.id} purchase={purchase} />
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>

              <CardFooter className="border-t gap-4 justify-between shrink-0">
                <div className="flex flex-col">
                  <span className="text-sm">Total da compra</span>
                  <span className="text-xs text-muted-foreground">{cwd.card.name}</span>
                </div>
                <HiddenValue className="w-24 h-7 dark:bg-muted-foreground/20">
                  <span className="text-lg text-destructive font-semibold">
                    {formatPrice(
                      cwd.purchases.reduce((sum, purchase) => sum + purchase.installmentsAmount, 0) / 100,
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
