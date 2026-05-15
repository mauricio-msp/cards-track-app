import { useSuspenseQuery } from '@tanstack/react-query'
import { getPublicMember } from '@/features/member/api/get-public-member'

export function usePublicMember(memberId: string) {
  return useSuspenseQuery({
    queryKey: ['public', 'members', memberId],
    queryFn: () => getPublicMember({ id: memberId }),
    refetchOnWindowFocus: false,
  })
}
