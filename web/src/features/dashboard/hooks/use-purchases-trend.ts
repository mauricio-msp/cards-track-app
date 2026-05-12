import { useSuspenseQuery } from '@tanstack/react-query'
import { getPurchasesTrend } from '@/features/dashboard/api'

export function usePurchasesTrend(year?: number) {
  return useSuspenseQuery({
    queryKey: ['purchases-trend', year],
    queryFn: () => getPurchasesTrend({ year }),
    refetchOnWindowFocus: false,
  })
}
