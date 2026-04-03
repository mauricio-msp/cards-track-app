import { useSuspenseQuery } from '@tanstack/react-query'
import { getMonthTotalDebtsAmount } from '@/features/dashboard/api'

export function useMonthTotalDebtsAmount() {
  return useSuspenseQuery({
    queryKey: ['month-total-debts-amount'],
    queryFn: getMonthTotalDebtsAmount,
    refetchOnWindowFocus: false,
  })
}
