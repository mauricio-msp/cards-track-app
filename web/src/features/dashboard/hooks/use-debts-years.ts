import { useSuspenseQuery } from '@tanstack/react-query'
import { getDebtsYears } from '@/features/dashboard/api'

export function useDebtsYears() {
  return useSuspenseQuery({
    queryKey: ['debts-years'],
    queryFn: getDebtsYears,
    refetchOnWindowFocus: false,
  })
}
