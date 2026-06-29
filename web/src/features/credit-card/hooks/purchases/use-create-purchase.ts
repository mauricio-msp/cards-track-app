import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createPurchase } from '@/features/credit-card/api'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function useCreatePurchase(cardId: string) {
  const queryClient = useQueryClient()
  const { month, year } = usePurchasesFilter()

  return useMutation({
    mutationFn: createPurchase,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'purchases', month, year] }),
        queryClient.invalidateQueries({
          queryKey: ['cards', cardId, 'month-total-amount', month, year],
        }),
        queryClient.invalidateQueries({ queryKey: ['cards', cardId, 'total-amount-used'] }),
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
      ])
    },
    onError: error => {
      console.error('Falha ao criar despesa:', error)
    },
  })
}
