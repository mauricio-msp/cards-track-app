import { useSuspenseQuery } from '@tanstack/react-query'
import { getTotalPurchasesAmount } from '@/features/dashboard/api'

export function useTotalPurchasesAmount() {
  return useSuspenseQuery({
    queryKey: ['total-purchases-amount'],
    queryFn: getTotalPurchasesAmount,
    refetchOnWindowFocus: false,
  })
}
