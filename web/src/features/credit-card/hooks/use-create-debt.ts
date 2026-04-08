import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createDebt } from '@/features/credit-card/api'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useCreateDebt(cardId: string) {
  const queryClient = useQueryClient()
  const { month, year } = useDebtsFilter()

  return useMutation({
    mutationFn: createDebt,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'debts', month, year] }),
        queryClient.invalidateQueries({
          queryKey: ['cards', cardId, 'month-total-amount', month, year],
        }),
        queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'total-amount-used'] }),
      ])
    },
    onError: error => {
      console.error('Failed to create debt:', error)
    },
  })
}
