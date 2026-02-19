import { useSuspenseQuery } from '@tanstack/react-query'
import { BanknoteX, CreditCard, Dot, Plus } from 'lucide-react'
import { getCardDebts } from '@/api/get-card-debts'
import { CreateDebtForm } from '@/components/forms/create-debt-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Progress } from '@/components/ui/progress'

import { formatPrice } from '@/helpers/format-price'
import { useFilterDebts } from '@/hooks/store/use-filter-debts-store'

export function CreditCardDebtsList({ cardId }: { cardId: string }) {
  const { month, year } = useFilterDebts()

  const {
    data: { debts },
  } = useSuspenseQuery({
    queryKey: ['cards', cardId, 'debts', month, year],
    queryFn: () => getCardDebts({ id: cardId, month, year }),
    refetchOnWindowFocus: false,
  })

  return (
    <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CreditCard />
          Despesas do Cartão
        </CardTitle>
      </CardHeader>
      <CardContent>
        {debts
          .sort((a, b) => {
            return Number(b.purchaseDate) - Number(a.purchaseDate)
          })
          .map(debt => (
            <div
              key={debt.groupId}
              data-complete={debt.remainingInstallments === 0}
              className="py-4 not-last:border-b flex items-center gap-4 data-[complete=true]:opacity-45"
            >
              <div className="size-10 bg-muted/50 rounded-lg grid place-items-center">
                <CreditCard className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col w-auto">
                <p className="text-lg text-primary">{debt.description}</p>
                <div className="text-sm text-muted-foreground flex items-center gap-0.5">
                  <span>
                    {new Date(debt.purchaseDate).toLocaleDateString('pt-BR', {
                      timeZone: 'UTC',
                    })}
                  </span>
                  <Dot />
                  <Badge variant="secondary">{debt.category}</Badge>
                  {debt.installmentsCount > 1 && (
                    <>
                      <Dot />
                      <span>
                        {debt.elapsedInstallments}/{debt.installmentsCount}x
                      </span>
                    </>
                  )}
                </div>

                {debt.installmentsCount > 1 && (
                  <div className="flex items-center gap-2">
                    <Progress
                      className="h-1 w-24"
                      value={(debt.elapsedInstallments * 100) / debt.installmentsCount}
                    />

                    <div className="text-sm text-muted-foreground">
                      {debt.remainingInstallments > 0
                        ? `Falta(m) ${debt.remainingInstallments} parcela(s)`
                        : 'Última parcela'}
                    </div>
                  </div>
                )}
              </div>
              <div className="ml-auto flex flex-col text-right">
                <p className="text-lg font-semibold">
                  {formatPrice(
                    debt.members.reduce((sum, member) => sum + member.installmentAmount / 100, 0),
                  )}
                </p>
                <span className="text-xs text-muted-foreground">
                  Total: {formatPrice(debt.totalAmount / 100)}
                </span>
                <div className="text-xs text-muted-foreground flex flex-col">
                  {debt.members.length > 1
                    ? debt.members.map(member => (
                        <span key={member.name}>
                          {member.name} ({formatPrice(member.installmentAmount / 100)})
                        </span>
                      ))
                    : debt.members[0].name}
                </div>
              </div>
            </div>
          ))}

        {!debts.length && (
          <Empty className="px-2 py-4 border border-dashed md:p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BanknoteX />
              </EmptyMedia>
              <EmptyTitle>No debts yet</EmptyTitle>
              <EmptyDescription>
                You haven't registered any <br /> expenses for this credit card.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateDebtForm>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Plus />
                  Add debt
                </Button>
              </CreateDebtForm>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
