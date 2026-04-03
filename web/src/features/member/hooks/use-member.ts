import { useSuspenseQuery } from '@tanstack/react-query'
import { getMember } from '@/features/member/api'

export function useMember(memberId: string) {
  return useSuspenseQuery({
    queryKey: ['members', memberId],
    queryFn: () => getMember({ id: memberId }),
    refetchOnWindowFocus: false,
  })
}
