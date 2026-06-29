import { Pencil, Trash2, UndoDot } from 'lucide-react'
import type { ElementType } from 'react'
import type { z } from 'zod'

import type { GetCardPurchasesItem } from '@/features/credit-card/api/get-card-purchases'

type Purchase = z.infer<typeof GetCardPurchasesItem>

interface MenuComponents {
  Group: ElementType
  Item: ElementType
  Sub: ElementType
  SubTrigger: ElementType
  SubContent: ElementType
  Separator: ElementType
}

interface PurchaseActionsItemsProps {
  components: MenuComponents
  purchase: Purchase
  isComplete: boolean
  onEdit: () => void
  onSelectAnticipate: (count: number) => void
  onDelete: () => void
}

export function PurchaseActionsItems({
  components: { Group, Item, Sub, SubTrigger, SubContent, Separator },
  purchase,
  isComplete,
  onEdit,
  onSelectAnticipate,
  onDelete,
}: PurchaseActionsItemsProps) {
  return (
    <>
      <Group>
        <Item
          onSelect={(event: Event) => {
            event.preventDefault()
            onEdit()
          }}
        >
          <Pencil /> Editar
        </Item>
      </Group>

      {!isComplete && purchase.anticipatableInstallments > 0 && (
        <Sub>
          <SubTrigger>
            <UndoDot className="mr-2" /> Antecipar parcelas
          </SubTrigger>
          <SubContent className="min-w-20">
            {Array.from({ length: purchase.anticipatableInstallments }, (_, i) => (
              <Item
                key={i}
                onSelect={(event: Event) => {
                  event.preventDefault()
                  onSelectAnticipate(i + 1)
                }}
              >
                {i + 1}x
              </Item>
            ))}
          </SubContent>
        </Sub>
      )}

      <Separator />

      <Item
        variant="destructive"
        onSelect={(event: Event) => {
          event.preventDefault()
          onDelete()
        }}
      >
        <Trash2 /> Excluir
      </Item>
    </>
  )
}
