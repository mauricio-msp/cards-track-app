import { BanknoteX, CreditCard, Plus } from 'lucide-react'
import { useMemo } from 'react'

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

import { PurchasesItem } from '@/features/credit-card/components/purchases/purchases-item'
import { CreatePurchaseForm } from '@/features/credit-card/components/forms'
import { useAnticipatePurchase, useCardPurchases, useDeletePurchase } from '@/features/credit-card/hooks'

export function PurchasesList({ cardId }: { cardId: string }) {
  const { mutateAsync: anticipatePurchaseFn } = useAnticipatePurchase(cardId)
  const { mutateAsync: deletePurchaseFn } = useDeletePurchase(cardId)

  const { data } = useCardPurchases(cardId)

  const sortedPurchases = useMemo(
    () => [...data.purchases].sort((a, b) => Number(b.purchaseDate) - Number(a.purchaseDate)),
    [data.purchases],
  )

  return (
    <Card
      data-few={sortedPurchases.length === 0}
      className="col-span-1 lg:col-span-2 xl:col-span-3 bg-background border-0 sm:bg-card sm:border py-0 sm:py-6 data-[few=true]:min-h-109"
    >
      <CardHeader className="px-0 sm:px-6">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5" />
          Despesas do Cartão
        </CardTitle>
        <CardDescription className="hidden text-muted-foreground text-sm sm:flex">
          Listagem de todas as despesas registradas neste cartão para o período selecionado,
          incluindo compras únicas e parceladas. Clique com o botão direito em qualquer item para
          editar, antecipar parcelas ou excluir a despesa.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 sm:gap-2 px-0 sm:px-6">
        {sortedPurchases.map(purchase => (
          <PurchasesItem
            key={purchase.groupId}
            purchase={purchase}
            onAnticipate={anticipatePurchaseFn}
            onDelete={deletePurchaseFn}
          />
        ))}

        {sortedPurchases.length === 0 && (
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
              <CreatePurchaseForm>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 size-4" /> Adicionar despesa
                </Button>
              </CreatePurchaseForm>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
