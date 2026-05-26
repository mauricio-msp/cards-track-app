import { Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { useCards } from '@/features/credit-card/hooks'
import { useMembers } from '@/features/member/hooks'

export function SettingsHeader() {
  const {
    data: { cards },
  } = useCards()
  const {
    data: { members },
  } = useMembers()

  return (
    <PageHeader>
      <PageHeader.Icon>
        <Settings2 />
      </PageHeader.Icon>
      <PageHeader.Title>Configurações</PageHeader.Title>
      <PageHeader.Description>
        Gerencie seu perfil, membros, cartões e preferências do app.
      </PageHeader.Description>
      <PageHeader.Action>
        <Badge variant="secondary">{cards.length} cartões</Badge>
        <Badge variant="secondary">{members.length} membros</Badge>
      </PageHeader.Action>
    </PageHeader>
  )
}
