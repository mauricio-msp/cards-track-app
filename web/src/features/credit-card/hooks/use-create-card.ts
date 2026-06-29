import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createCard } from '@/features/credit-card/api'

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      toast.success('Cartão criado com sucesso!')
    },
    onError: error => {
      console.error('Falha ao criar cartão:', error)
      toast.error('Falhou ao criar o cartão. Por favor, tente novamente.')
    },
  })
}
