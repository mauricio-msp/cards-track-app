import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { CirclePlus, CreditCard, Inbox, Plus } from 'lucide-react'

import { getCards } from '@/api/get-cards'
import { CreateCreditCardForm } from '@/components/forms/create-credit-card-form'

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

import { creditCards } from '@/helpers/credit-cards'
import { formatPrice } from '@/helpers/format-price'

export function CardsNav() {
  const { data } = useSuspenseQuery({
    queryKey: ['credit-cards'],
    queryFn: getCards,
    refetchOnWindowFocus: false,
  })

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <CreditCard className="mr-2" />
        My Credit Cards ({data.cards.length})
        <CreateCreditCardForm>
          <Button size="icon-sm" variant="ghost" className="ml-auto cursor-pointer">
            <CirclePlus />
          </Button>
        </CreateCreditCardForm>
      </SidebarGroupLabel>
      <SidebarMenu className="gap-2">
        {data.cards.map(card => (
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

        {!data.cards.length && (
          <Empty className="p-2 md:p-2 border border-dashed mt-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>No credit cards yet</EmptyTitle>
              <EmptyDescription>
                Add your first credit card to start tracking limits, debts, and monthly spending.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateCreditCardForm>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Plus />
                  Add credit card
                </Button>
              </CreateCreditCardForm>
            </EmptyContent>
          </Empty>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
