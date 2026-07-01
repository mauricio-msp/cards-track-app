import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { reconcileAnticipations } from '@/features/credit-card/api/reconcile-anticipations'

export function useReconcileAnticipations(cardId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => reconcileAnticipations(cardId),
    onSuccess: result => {
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      queryClient.invalidateQueries({
        predicate: query => query.queryKey[0] === 'cards' && query.queryKey[1] === cardId,
      })
      toast.success(
        `Reconciliado: ${result.cotasAfetadas} cota(s), ${result.parcelasMovidas} parcela(s) movida(s).`,
      )
    },
    onError: error => {
      console.error('Falha ao reconciliar antecipações:', error)
      toast.error('Falha ao reconciliar antecipações. Tente novamente.')
    },
  })
}
