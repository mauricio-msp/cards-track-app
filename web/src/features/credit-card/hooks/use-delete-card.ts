import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteCard } from '@/features/credit-card/api'

export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      toast.success('Cartão excluído com sucesso.')
    },
    onError: (error: Error) => {
      console.error('Failed to delete card:', error)
      toast.error('Erro ao deletar cartão. Por favor, tente novamente.')
    },
  })
}
