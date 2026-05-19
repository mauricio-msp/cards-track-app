import { useSuspenseQuery } from '@tanstack/react-query'
import { getMemberPurchases } from '@/features/member/api'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function useMemberPurchases(memberId: string) {
  const { month, year } = usePurchasesFilter()

  return useSuspenseQuery({
    queryKey: ['members', memberId, 'purchases', month, year],
    queryFn: () => getMemberPurchases({ id: memberId, month, year }),
    refetchOnWindowFocus: false,
  })
}
