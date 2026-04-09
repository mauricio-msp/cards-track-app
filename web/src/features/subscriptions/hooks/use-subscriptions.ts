import { useSuspenseQuery } from '@tanstack/react-query'
import { getSubscriptions } from '@/features/subscriptions/api/get-subscriptions'

export function useSubscriptions() {
  return useSuspenseQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
    refetchOnWindowFocus: false,
  })
}
