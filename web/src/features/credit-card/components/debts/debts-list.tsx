import { BanknoteX, CreditCard, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

import { DebtsItem } from '@/features/credit-card/components/debts/debts-item'
import { CreateDebtForm } from '@/features/credit-card/components/forms'
import { useAnticipateDebt, useCardDebts, useDeleteDebt } from '@/features/credit-card/hooks'

export function DebtsList({ cardId }: { cardId: string }) {
  const { mutateAsync: anticipateDebtFn } = useAnticipateDebt(cardId)
  const { mutateAsync: deleteDebtFn } = useDeleteDebt(cardId)

  const { data } = useCardDebts(cardId)

  const sortedDebts = [...data.debts].sort(
    (a, b) => Number(b.purchaseDate) - Number(a.purchaseDate),
  )

  return (
    <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Despesas do Cartão
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Listagem de todas as despesas registradas neste cartão para o período selecionado,
          incluindo compras únicas e parceladas. Clique com o botão direito em qualquer item para
          editar, antecipar parcelas ou excluir a despesa.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sortedDebts.map(debt => (
          <DebtsItem
            key={debt.groupId}
            debt={debt}
            onAnticipate={installments =>
              anticipateDebtFn({
                debtId: debt.debtId,
                anticipateFromInstallment: installments,
              })
            }
            onDelete={debtId => deleteDebtFn(debtId)}
          />
        ))}

        {sortedDebts.length === 0 && (
          <Empty className="px-2 py-8 border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BanknoteX />
              </EmptyMedia>
              <EmptyTitle>Nenhuma despesa</EmptyTitle>
              <EmptyDescription>
                Você ainda não registrou despesas para este cartão neste período.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateDebtForm>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 size-4" /> Adicionar despesa
                </Button>
              </CreateDebtForm>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
