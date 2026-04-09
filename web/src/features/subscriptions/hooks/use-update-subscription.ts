import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateSubscription } from '@/features/subscriptions/api/update-subscription'

export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      toast.success('Assinatura atualizada!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falhou ao atualizar assinatura')
    },
  })
}
