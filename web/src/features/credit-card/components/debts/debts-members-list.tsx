import { Link } from '@tanstack/react-router'
import { Plus, User, UserX } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { Separator } from '@/components/ui/separator'

import { CreateDebtForm } from '@/features/credit-card/components/forms'
import { useCardDebts, useMonthTotalAmountCard } from '@/features/credit-card/hooks'
import { formatPrice, getInitialLetters } from '@/lib/utils'

type Member = {
  id: string
  name: string
  relationship: string
  installmentAmount: number
}

export function DebtsMembersList({ cardId }: { cardId: string }) {
  const {
    data: { debts },
  } = useCardDebts(cardId)

  const {
    data: { totalAmountMonth },
  } = useMonthTotalAmountCard(cardId)

  const members = debts.flatMap(debt => debt.members)

  const memberByDebts = members.reduce(
    (acc, member) => {
      const id = member.id

      if (!acc[id]) {
        acc[id] = {
          id,
          name: member.name,
          relationship: member.relationship,
          installmentAmount: 0,
        }
      }

      acc[id].installmentAmount += member.installmentAmount

      return acc
    },
    {} as Record<string, Omit<Member, 'remainingInstallments'>>,
  )

  return (
    <Card className="h-max col-span-1 lg:col-span-2 xl:col-span-1 sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User />
          Total por Pessoa
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {Object.values(memberByDebts)
          .sort((a, b) => b.installmentAmount - a.installmentAmount)
          .map(member => {
            const percentUsage = Number(
              ((member.installmentAmount / 100) * 100) / (totalAmountMonth / 100),
            )

            return (
              <Link
                to="/members/$id"
                key={member.id}
                params={{ id: member.id }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>{getInitialLetters(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.relationship}</span>
                  </div>

                  <div className="flex flex-col text-right ml-auto">
                    <span className="text-sm font-semibold">
                      {formatPrice(member.installmentAmount / 100)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {percentUsage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress value={percentUsage} className="h-1.5" />
              </Link>
            )
          })}

        {members.length ? (
          <>
            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-lg">Total Geral</span>
              <span className="text-xl font-semibold text-destructive">
                {formatPrice(totalAmountMonth / 100)}
              </span>
            </div>
          </>
        ) : (
          <Empty className="px-2 py-4 border border-dashed md:p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserX />
              </EmptyMedia>
              <EmptyTitle>Nenhum membro registrado</EmptyTitle>
              <EmptyDescription>
                Nenhum dos membros registrados possui despesas neste cartão de crédito ainda.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateDebtForm>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Plus />
                  Adicionar despesa
                </Button>
              </CreateDebtForm>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
