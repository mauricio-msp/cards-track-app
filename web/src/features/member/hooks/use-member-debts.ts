import { useSuspenseQuery } from '@tanstack/react-query'
import { getMemberDebts } from '@/features/member/api'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useMemberDebts(memberId: string) {
  const { month, year } = useDebtsFilter()

  return useSuspenseQuery({
    queryKey: ['members', memberId, 'debts', month, year],
    queryFn: () => getMemberDebts({ id: memberId, month, year }),
    refetchOnWindowFocus: false,
  })
}
