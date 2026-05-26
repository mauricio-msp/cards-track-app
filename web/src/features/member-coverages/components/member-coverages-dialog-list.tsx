import { CoveragesList } from '@/features/member-coverages/components/coverages-list'
import { useMemberCoverages } from '@/features/member-coverages/hooks/use-member-coverages'

type CoveragesListContentProps = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}

export function CoveragesListContent({
  memberId,
  cardId,
  targetMonth,
  targetYear,
}: CoveragesListContentProps) {
  const { data } = useMemberCoverages({ memberId, cardId, targetMonth, targetYear })

  return (
    <CoveragesList
      memberId={memberId}
      cardId={cardId}
      targetMonth={targetMonth}
      targetYear={targetYear}
      coverages={data.coverages}
      totalCovered={data.totalCovered}
      totalRepaid={data.totalRepaid}
      totalRemaining={data.totalRemaining}
    />
  )
}
