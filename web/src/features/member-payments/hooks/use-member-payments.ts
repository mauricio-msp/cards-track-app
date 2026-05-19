import { useSuspenseQuery } from '@tanstack/react-query'
import { getMemberPayments } from '@/features/member-payments/api/get-member-payments'

export function memberPaymentsQueryKey(
  memberId: string,
  cardId: string,
  targetMonth: number,
  targetYear: number,
) {
  return ['members', memberId, 'cards', cardId, 'payments', targetMonth, targetYear] as const
}

export function useMemberPayments(params: {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  return useSuspenseQuery({
    queryKey: memberPaymentsQueryKey(
      params.memberId,
      params.cardId,
      params.targetMonth,
      params.targetYear,
    ),
    queryFn: () =>
      getMemberPayments({
        memberId: params.memberId,
        cardId: params.cardId,
        month: params.targetMonth,
        year: params.targetYear,
      }),
    refetchOnWindowFocus: false,
  })
}
