import { useSuspenseQuery } from '@tanstack/react-query'
import { getTotalDebtsAmount } from '@/features/dashboard/api'

export function useTotalDebtsAmount() {
  return useSuspenseQuery({
    queryKey: ['total-debts-amount'],
    queryFn: getTotalDebtsAmount,
    refetchOnWindowFocus: false,
  })
}
