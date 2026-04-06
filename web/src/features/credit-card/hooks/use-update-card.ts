import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCard } from '@/features/credit-card/api'

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    // TODO: o updateCard já está estruturado — apenas o fetch interno está comentado.
    // Quando o BE estiver pronto, descomentar o fetch em api/update-card.ts.
    mutationFn: updateCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
    },
    onError: (error: Error) => {
      console.error('Failed to update card:', error)
    },
  })
}
