import { useSuspenseQuery } from '@tanstack/react-query'
import { getPublicMemberPurchases } from '@/features/member/api/get-public-member-purchases'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function usePublicMemberPurchases(memberId: string) {
  const { month, year } = usePurchasesFilter()

  return useSuspenseQuery({
    queryKey: ['public', 'members', memberId, 'purchases', month, year],
    queryFn: () => getPublicMemberPurchases({ id: memberId, month, year }),
    refetchOnWindowFocus: false,
  })
}
