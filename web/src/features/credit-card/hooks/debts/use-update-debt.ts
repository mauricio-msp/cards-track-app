import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateDebt } from '@/features/credit-card/api'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useUpdateDebt(cardId: string) {
  const queryClient = useQueryClient()
  const { month, year } = useDebtsFilter()

  return useMutation({
    mutationFn: updateDebt,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'debts', month, year] }),
        queryClient.invalidateQueries({
          queryKey: ['cards', cardId, 'month-total-amount', month, year],
        }),
        queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'total-amount-used'] }),
      ])
    },
    onError: (error: Error) => {
      console.error('Failed to update debt:', error)
    },
  })
}
