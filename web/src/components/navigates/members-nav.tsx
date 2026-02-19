import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { CirclePlus, Plus, UserRoundX, Users } from 'lucide-react'
import { useEffect } from 'react'
import { getMembers } from '@/api/get-members'
import { CreateCreditCardForm } from '@/components/forms/create-credit-card-form'
import { CreateMemberForm } from '@/components/forms/create-member-form'
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
import { useMembersStore } from '@/hooks/store/use-members-store'

export function MembersNav() {
  const setMembers = useMembersStore(state => state.setMembers)

  const { data } = useSuspenseQuery({
    queryKey: ['members'],
    queryFn: getMembers,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    setMembers(data.members)
  }, [setMembers, data.members])

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <Users className="mr-2" />
        Members ({data.members.length})
        <CreateMemberForm>
          <Button size="icon-sm" variant="ghost" className="ml-auto cursor-pointer">
            <CirclePlus />
          </Button>
        </CreateMemberForm>
      </SidebarGroupLabel>
      <SidebarMenu>
        {data.members.map(member => (
          <SidebarMenuItem key={member.id}>
            <SidebarMenuButton asChild>
              <Link to="/members/$id" params={{ id: member.id }} className="h-auto">
                {member.name}
                <span className="text-muted-foreground text-sm">· {member.relationship}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {!data.members.length && (
          <Empty className="p-2 md:p-2 border border-dashed mt-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRoundX />
              </EmptyMedia>
              <EmptyTitle>No members yet</EmptyTitle>
              <EmptyDescription>Add your first member.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateCreditCardForm>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Plus />
                  Add member
                </Button>
              </CreateCreditCardForm>
            </EmptyContent>
          </Empty>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
