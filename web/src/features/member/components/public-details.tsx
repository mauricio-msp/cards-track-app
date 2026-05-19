import { Dot, User, UserStar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePublicMember } from '@/features/member/hooks/use-public-member'
import { usePublicMemberPurchases } from '@/features/member/hooks/use-public-member-purchases'
import { creditCards } from '@/helpers/credit-cards'
import { MONTHS } from '@/helpers/months'
import { formatPrice } from '@/lib/utils'

export function PublicDetails({ memberId }: { memberId: string }) {
  const {
    data: { member },
  } = usePublicMember(memberId)

  const {
    data: { cardsWithPurchases },
  } = usePublicMemberPurchases(memberId)

  const allPurchases = cardsWithPurchases.flatMap(cwd => cwd.purchases)
  const totalAmount = allPurchases.reduce((total, p) => total + p.installmentsAmount, 0)
  const totalPurchasesCount = allPurchases.length
  const cardsCount = cardsWithPurchases.length

  const firstCard = cardsWithPurchases[0]
  const competenceText = firstCard
    ? `${MONTHS[firstCard.card.targetMonth]}/${firstCard.card.targetYear}`
    : null

  const cardStats = cardsWithPurchases
    .map(cwd => {
      const cardTotal = cwd.purchases.reduce((sum, p) => sum + p.installmentsAmount, 0)
      const percentage = totalAmount > 0 ? Math.round((cardTotal / totalAmount) * 100) : 0
      const brand = creditCards.find(cc => cc.name.toLowerCase() === cwd.card.name)
      return {
        name: cwd.card.name,
        amount: cardTotal,
        percentage,
        color: brand?.color ?? '#888888',
      }
    })
    .filter(s => s.percentage > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="border rounded-2xl p-4 bg-card flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="size-12 rounded-full border-2 border-border grid place-items-center bg-muted/50 shrink-0">
          {['titular', 'Titular'].includes(member.relationship) ? <UserStar /> : <User />}
        </div>

        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-semibold">{member.name}</span>
            <Badge variant="outline">{member.relationship.toLowerCase()}</Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
            <span>
              <strong className="text-foreground">{cardsCount}</strong> cartões
            </span>
            <Dot className="size-4 shrink-0" />
            <span>
              <strong className="text-foreground">{totalPurchasesCount}</strong> compras
            </span>
            {competenceText && (
              <>
                <Dot className="size-4 shrink-0" />
                <span className="hidden md:inline">
                  Competência atual <strong className="text-foreground">{competenceText}</strong>
                </span>
                <span className="md:hidden md:text-foreground md:font-semibold">
                  {competenceText}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end shrink-0">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Total de compras
          </span>
          <span className="text-2xl text-destructive font-semibold">
            {formatPrice(totalAmount / 100)}
          </span>
        </div>
      </div>

      <Separator className="md:hidden" />

      <div className="md:hidden flex flex-col gap-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          Total de compras
        </span>
        <span className="text-5xl text-destructive font-bold">
          {formatPrice(totalAmount / 100)}
        </span>
      </div>

      {cardStats.length > 0 && (
        <>
          <div className="flex h-1.5 rounded-full overflow-hidden">
            {cardStats.map(stat => (
              <div
                key={stat.name}
                style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                className="h-full"
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {cardStats.map(stat => (
              <div key={stat.name} className="flex items-center gap-1.5 text-sm">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: stat.color }}
                />
                <span>{stat.name}</span>
                <span className="text-muted-foreground">{stat.percentage}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
