import { useSuspenseQuery } from '@tanstack/react-query'
import { User, UserStar } from 'lucide-react'
import { getMember } from '@/api/get-member'
import { getMemberDebts } from '@/api/get-member-debts'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/helpers/format-price'
import { useFilterDebts } from '@/hooks/store/use-filter-debts-store'

export function MemberDetails({ memberId }: { memberId: string }) {
  const { month, year } = useFilterDebts()

  const {
    data: { member },
  } = useSuspenseQuery({
    queryKey: ['members', memberId],
    queryFn: () => getMember({ id: memberId }),
    refetchOnWindowFocus: false,
  })

  const {
    data: { cardsWithDebts },
  } = useSuspenseQuery({
    queryKey: ['members', memberId, 'debts', month, year],
    queryFn: () => getMemberDebts({ id: memberId, month, year }),
  })

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
