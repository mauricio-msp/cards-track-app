import { useSuspenseQuery } from '@tanstack/react-query'
import { getDebtsTrend } from '@/features/dashboard/api'

export function useDebtsTrend(year?: number) {
  return useSuspenseQuery({
    queryKey: ['debts-charts', year],
    queryFn: () => getDebtsTrend({ year }),
    refetchOnWindowFocus: false,
  })
}
