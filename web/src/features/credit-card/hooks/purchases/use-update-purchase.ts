import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updatePurchase } from '@/features/credit-card/api'
import { usePurchasesFilter } from '@/hooks/store/use-purchases-filter-store'

export function useUpdatePurchase(cardId: string) {
  const queryClient = useQueryClient()
  const { month, year } = usePurchasesFilter()

  return useMutation({
    mutationFn: updatePurchase,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'purchases', month, year] }),
        queryClient.invalidateQueries({
          queryKey: ['cards', cardId, 'month-total-amount', month, year],
        }),
        queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'total-amount-used'] }),
      ])
    },
    onError: (error: Error) => {
      console.error('Failed to update purchase:', error)
    },
  })
}
