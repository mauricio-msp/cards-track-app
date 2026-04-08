import { CreditCard, Pencil, Plus, Trash2 } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HiddenValue } from '@/components/ui/hidden-value'
import { Separator } from '@/components/ui/separator'
import { CreateCardForm, UpdateCardForm } from '@/features/credit-card/components/forms'
import { useCards } from '@/features/credit-card/hooks'
// import { useDeleteCard } from '@/features/credit-card/hooks/use-delete-card'
import { creditCards } from '@/helpers/credit-cards'
import { formatPrice } from '@/lib/utils'

export function CardsCard() {
  const {
    data: { cards },
  } = useCards()
  // const { mutateAsync: deleteCardFn } = useDeleteCard()

  return (
    <Card>
      <CardHeader className="justify-items-start">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4" />
            Cartões
          </CardTitle>
          <CardDescription>Gerencie seus cartões de crédito cadastrados.</CardDescription>
        </div>
        <CreateCardForm>
          <Button variant="outline" size="sm" className="shrink-0">
            <Plus className="size-3.5" />
            Adicionar
          </Button>
        </CreateCardForm>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {cards.map((card, index) => (
          <React.Fragment key={card.id}>
            {index > 0 && <Separator />}
            <div className="flex items-center gap-3 py-3">
              <div className="size-9 rounded-lg bg-muted/50 grid place-items-center shrink-0">
                {creditCards
                  .find(cc => cc.name.toLowerCase() === card.name.toLowerCase())
                  ?.icon({}) ?? <CreditCard className="size-4 text-muted-foreground" />}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium capitalize truncate">{card.name}</span>
                <span className="text-xs text-muted-foreground">
                  Limite:{' '}
                  <HiddenValue placeholder="****">{formatPrice(card.limit / 100)}</HiddenValue>
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <UpdateCardForm card={card}>
                  <Button variant="outline" size="sm" className="min-w-20">
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                </UpdateCardForm>
                <Button disabled variant="destructive" size="sm" className="min-w-20">
                  <Trash2 className="size-3.5" />
                  Excluir
                </Button>
                {/* <ContextMenuDeleteItem
                  title="Remover cartão"
                  description={`Tem certeza que deseja remover o cartão ${card.name}? Todas as despesas e faturas associadas serão excluídas permanentemente.`}
                  onConfirm={() => deleteCardFn(card.id)}
                  trigger={
                    <Button variant="outline" size="sm" className="min-w-20 text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                      Remover
                    </Button>
                  }
                /> */}
              </div>
            </div>
          </React.Fragment>
        ))}

        {cards.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum cartão cadastrado.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
