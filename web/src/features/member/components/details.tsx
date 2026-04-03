import { User, UserStar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useMember, useMemberDebts } from '@/features/member/hooks'
import { formatPrice } from '@/lib/utils'

export function Details({ memberId }: { memberId: string }) {
  const {
    data: { member },
  } = useMember(memberId)

  const {
    data: { cardsWithDebts },
  } = useMemberDebts(memberId)

  const totalAmount = cardsWithDebts
    .flatMap(cwd => cwd.debts)
    .reduce((total, cwd) => total + cwd.installmentsAmount, 0)

  return (
    <header className="flex items-center gap-2">
      <div className="bg-muted/50 rounded-xl size-12 grid place-items-center">
        {['titular', 'Titular'].includes(member.relationship) ? <UserStar /> : <User />}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl">{member.name}</span>
        <Badge variant="outline">{member.relationship}</Badge>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <span className="text-3xl text-destructive font-semibold">
          {formatPrice(totalAmount / 100)}
        </span>
        <span className="text-sm text-muted-foreground">Total de dívidas</span>
      </div>
    </header>
  )
}
