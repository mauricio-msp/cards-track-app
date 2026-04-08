import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateCard } from '@/features/credit-card/api'

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCard,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      queryClient.invalidateQueries({ queryKey: ['cards', variables.id] })
    },
    onError: (error: Error) => {
      console.error('Failed to update card:', error)
      toast.error('Erro ao atualizar cartão. Por favor, tente novamente.')
    },
  })
}
