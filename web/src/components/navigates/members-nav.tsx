import { Link } from '@tanstack/react-router'

import { CirclePlus, Plus, UserRoundX, Users } from 'lucide-react'
import { useEffect } from 'react'
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
import { useMembersStore } from '@/hooks/store/use-members-store'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = [
  'border border-rose-400/50 text-rose-400/60 bg-rose-400/10',
  'border border-pink-400/50 text-pink-400/60 bg-pink-400/10',
  'border border-fuchsia-400/50 text-fuchsia-400/60 bg-fuchsia-400/10',
  'border border-purple-400/50 text-purple-400/60 bg-purple-400/10',
  'border border-violet-400/50 text-violet-400/60 bg-violet-400/10',
  'border border-indigo-400/50 text-indigo-400/60 bg-indigo-400/10',
  'border border-blue-400/50 text-blue-400/60 bg-blue-400/10',
  'border border-sky-400/50 text-sky-400/60 bg-sky-400/10',
  'border border-cyan-400/50 text-cyan-400/60 bg-cyan-400/10',
  'border border-teal-400/50 text-teal-400/60 bg-teal-400/10',
  'border border-emerald-400/50 text-emerald-400/60 bg-emerald-400/10',
  'border border-green-400/50 text-green-400/60 bg-green-400/10',
  'border border-lime-400/50 text-lime-400/60 bg-lime-400/10',
  'border border-amber-400/50 text-amber-400/60 bg-amber-400/10',
  'border border-orange-400/50 text-orange-400/60 bg-orange-400/10',
]

function getAvatarColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

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
