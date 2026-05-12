import { useSuspenseQuery } from '@tanstack/react-query'
import { getPurchasesYears } from '@/features/dashboard/api'

export function usePurchasesYears() {
  return useSuspenseQuery({
    queryKey: ['purchases-years'],
    queryFn: getPurchasesYears,
    refetchOnWindowFocus: false,
  })
}
