import { Link } from '@tanstack/react-router'

import { CirclePlus, CreditCard, Inbox, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { CreateCardForm } from '@/features/credit-card/components/forms'
import { useCards } from '@/features/credit-card/hooks'
import { creditCards } from '@/helpers/credit-cards'
import { formatPrice } from '@/lib/utils'

export function CardsNav() {
  const {
    data: { cards },
  } = useCards()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <CreditCard className="mr-2" />
        Meus cartões ({cards.length})
        <CreateCardForm>
          <Button size="icon-sm" variant="ghost" className="ml-auto cursor-pointer">
            <CirclePlus />
          </Button>
        </CreateCardForm>
      </SidebarGroupLabel>
      <SidebarMenu className="gap-2">
        {cards.map(card => (
          <SidebarMenuItem key={card.id}>
            <SidebarMenuButton asChild>
              <Link to="/credit-card/$id" params={{ id: card.id }} className="h-auto">
                {creditCards
                  ?.find(cc => cc.name.toLowerCase() === card.name.toLowerCase())
                  ?.icon({})}
                <div className="flex-1 flex items-center justify-between">
                  <span className="inline-flex">{card.name}</span>
                  <span className="inline-flex text-muted-foreground">
                    {formatPrice(card.limit / 100)}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {!cards.length && (
          <Empty className="p-2 md:p-2 border border-dashed mt-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>Nenhum cartão de crédito adicionado</EmptyTitle>
              <EmptyDescription>
                Adicione seu primeiro cartão de crédito para começar a rastrear limites, dívidas e
                gastos mensais.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateCardForm>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Plus />
                  Adicionar cartão de crédito
                </Button>
              </CreateCardForm>
            </EmptyContent>
          </Empty>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
