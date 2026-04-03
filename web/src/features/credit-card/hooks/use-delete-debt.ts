import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDebt } from '@/features/credit-card/api'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useDeleteDebt(cardId: string) {
  const queryClient = useQueryClient()
  const { month, year } = useDebtsFilter()

  return useMutation({
    mutationFn: deleteDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'debts', month, year] })
      queryClient.invalidateQueries({
        queryKey: ['cards', cardId, 'month-total-amount', month, year],
      })
      queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'total-amount-used'] })
    },
    onError: error => {
      console.error('Falha ao excluir dívida:', error)
    },
  })
}
