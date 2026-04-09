import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteSubscription } from '@/features/subscriptions/api/delete-subscription'

export function useDeleteSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
      toast.success('Assinatura desativada!')
    },
    onError: () => {
      toast.error('Falhou ao desativar assinatura')
    },
  })
}
