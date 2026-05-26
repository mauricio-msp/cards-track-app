import { useSuspenseQuery } from '@tanstack/react-query'
import { getMemberCoverages } from '@/features/member-coverages/api/get-member-coverages'

export function memberCoveragesQueryKey(
  memberId: string,
  cardId: string,
  targetMonth: number,
  targetYear: number,
) {
  return ['members', memberId, 'cards', cardId, 'coverages', targetMonth, targetYear] as const
}

export function useMemberCoverages(params: {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  return useSuspenseQuery({
    queryKey: memberCoveragesQueryKey(
      params.memberId,
      params.cardId,
      params.targetMonth,
      params.targetYear,
    ),
    queryFn: () =>
      getMemberCoverages({
        memberId: params.memberId,
        cardId: params.cardId,
        month: params.targetMonth,
        year: params.targetYear,
      }),
    refetchOnWindowFocus: false,
  })
}
