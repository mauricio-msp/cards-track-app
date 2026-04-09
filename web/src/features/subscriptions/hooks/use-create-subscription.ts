import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createSubscription } from '@/features/subscriptions/api/create-subscription'

export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success('Assinatura criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falhou ao criar assinatura')
    },
  })
}
