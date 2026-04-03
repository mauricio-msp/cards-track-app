import { useSuspenseQuery } from '@tanstack/react-query'
import { getMembers } from '@/features/member/api'

export function useMembers() {
  return useSuspenseQuery({
    queryKey: ['members'],
    queryFn: getMembers,
    refetchOnWindowFocus: false,
  })
}
