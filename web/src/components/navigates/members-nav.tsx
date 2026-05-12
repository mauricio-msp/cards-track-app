import { Link } from '@tanstack/react-router'

import { CirclePlus, Plus, UserRoundX, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function MembersNav() {
  const {
    data: { members },
  } = useMembers()

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
              <Link to="/members/$id" params={{ id: member.id }} className="h-auto py-1.5">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="truncate leading-tight">{member.name}</span>
                  <span className="text-muted-foreground text-xs lowercase leading-tight">
                    {member.relationship}
                  </span>
                </div>
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
