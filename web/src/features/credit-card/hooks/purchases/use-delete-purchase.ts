import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePurchase } from '@/features/credit-card/api'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function useDeletePurchase(cardId: string) {
  const queryClient = useQueryClient()
  const { month, year } = usePurchasesFilter()

  return useMutation({
    mutationFn: deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'purchases', month, year] })
      queryClient.invalidateQueries({
        queryKey: ['cards', cardId, 'month-total-amount', month, year],
      })
      queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'total-amount-used'] })
    },
    onError: error => {
      console.error('Falha ao excluir compra:', error)
    },
  })
}
