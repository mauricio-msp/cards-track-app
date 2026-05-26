import { useSuspenseQuery } from '@tanstack/react-query'
import { getAllCoverages } from '@/features/coverages-summary/api/get-all-coverages'

export function allCoveragesQueryKey(month?: number, year?: number) {
  return ['coverages', 'all', { month, year }] as const
}

export function useAllCoverages(params: { month?: number; year?: number }) {
  return useSuspenseQuery({
    queryKey: allCoveragesQueryKey(params.month, params.year),
    queryFn: () => getAllCoverages(params),
    refetchOnWindowFocus: false,
  })
}
