import { Dot, Pencil, Phone, User, UserStar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HiddenValue } from '@/components/ui/hidden-value'
import { UpdateMemberForm } from '@/features/member/components/update-member-form'
import { useMember, useMemberDebts } from '@/features/member/hooks'
import { formatPhone, formatPrice } from '@/lib/utils'

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
        <div className="flex items-center gap-1">
          <span className="text-2xl">{member.name}</span>
          <UpdateMemberForm member={member}>
            <Button size="icon-xs" variant="outline" className="ml-2 cursor-pointer">
              <Pencil />
            </Button>
          </UpdateMemberForm>
        </div>
        <div className="flex items-center gap-0.5">
          <Badge variant="outline">{member.relationship.toLowerCase()}</Badge>
          {member.phone && (
            <>
              <Dot />
              <Badge variant="outline">
                <Phone className="size-2" />
                {formatPhone(member.phone)}
              </Badge>
            </>
          )}
        </div>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <HiddenValue className="w-36 h-9 dark:bg-muted-foreground/20">
          <span className="text-3xl text-destructive font-semibold">
            {formatPrice(totalAmount / 100)}
          </span>
        </HiddenValue>
        <span className="text-sm text-muted-foreground mt-0.5">Total de dívidas</span>
      </div>
    </header>
  )
}
