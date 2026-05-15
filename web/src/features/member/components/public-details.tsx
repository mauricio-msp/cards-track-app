import { Dot, Phone, User, UserStar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { usePublicMember } from '@/features/member/hooks/use-public-member'
import { usePublicMemberPurchases } from '@/features/member/hooks/use-public-member-purchases'
import { cn, formatPhone, formatPrice } from '@/lib/utils'

export function PublicDetails({ memberId }: { memberId: string }) {
  const {
    data: { member },
  } = usePublicMember(memberId)

  const {
    data: { cardsWithPurchases },
  } = usePublicMemberPurchases(memberId)

  const totalAmount = cardsWithPurchases
    .flatMap(cwd => cwd.purchases)
    .reduce((total, p) => total + p.installmentsAmount, 0)

  return (
    <header className="flex items-center gap-2 flex-wrap shrink-0">
      <div className="bg-muted/50 rounded-xl size-12 grid place-items-center">
        {['titular', 'Titular'].includes(member.relationship) ? <UserStar /> : <User />}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-2xl">{member.name}</span>
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

      <div
        className={cn(
          'ml-auto flex flex-col items-start shrink-0',
          'dark:bg-muted/40 bg-muted border rounded-2xl p-4 w-full',
          'md:w-auto md:dark:bg-transparent md:bg-transparent md:items-end md:border-0',
        )}
      >
        <span className="text-3xl text-destructive font-semibold">
          {formatPrice(totalAmount / 100)}
        </span>
        <span className="text-sm text-muted-foreground mt-0.5">Total de compras</span>
      </div>
    </header>
  )
}
