import { Settings2 } from 'lucide-react'
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
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Settings2 className="size-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Gerencie seu perfil, membros, cartões e preferências do app.
        </p>
      </div>
      <div className="flex items-center gap-2 pt-1 shrink-0">
        <Badge variant="secondary">{cards.length} cartões</Badge>
        <Badge variant="secondary">{members.length} membros</Badge>
      </div>
    </div>
  )
}
