import { Link } from '@tanstack/react-router'

import { CirclePlus, Plus, UserRoundX, Users } from 'lucide-react'
import { useEffect } from 'react'
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
import { CreateMemberForm } from '@/features/member/components/create-member-form'
import { useMembers } from '@/features/member/hooks'
import { useMembersStore } from '@/hooks/store/use-members-store'

export function MembersNav() {
  const setMembers = useMembersStore(state => state.setMembers)

  const {
    data: { members },
  } = useMembers()

  useEffect(() => {
    setMembers(members)
  }, [setMembers, members])

  const titularMember = members.find(member => member.relationship === 'Titular')
  const otherMembers = members
    .filter(member => member.relationship !== 'Titular')
    .sort((a, b) => a.name.localeCompare(b.name))
  const sortedMembers = titularMember ? [titularMember, ...otherMembers] : otherMembers

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
        <Users className="mr-2" />
        Membros ({sortedMembers.length})
        <CreateMemberForm>
          <Button size="icon-sm" variant="ghost" className="ml-auto cursor-pointer">
            <CirclePlus />
          </Button>
        </CreateMemberForm>
      </SidebarGroupLabel>
      <SidebarMenu>
        {sortedMembers.map(member => (
          <SidebarMenuItem key={member.id}>
            <SidebarMenuButton asChild>
              <Link to="/members/$id" params={{ id: member.id }} className="h-auto">
                {member.name}
                <span className="text-muted-foreground text-sm">· {member.relationship}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {!members.length && (
          <Empty className="p-2 md:p-2 border border-dashed mt-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserRoundX />
              </EmptyMedia>
              <EmptyTitle>Nenhum membro adicionado</EmptyTitle>
              <EmptyDescription>Adicione seu primeiro membro.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateMemberForm>
                <Button variant="outline" size="sm" className="cursor-pointer">
                  <Plus />
                  Adicionar membro
                </Button>
              </CreateMemberForm>
            </EmptyContent>
          </Empty>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
