import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCard } from '@/features/credit-card/api'

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
    },
    onError: error => {
      console.error('Failed to create card:', error)
    },
  })
}
