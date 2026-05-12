import { useMutation, useQueryClient } from '@tanstack/react-query'
import { anticipatePurchase } from '@/features/credit-card/api/anticipate-purchase'
import { usePurchasesFilter } from '@/hooks/store/use-purchases-filter-store'

export function useAnticipatePurchase(cardId: string) {
  const queryClient = useQueryClient()
  const { month, year } = usePurchasesFilter()

  return useMutation({
    mutationFn: anticipatePurchase,
    onSuccess: async () => {
      const keys = [
        ['cards', cardId, 'purchases', month, year],
        ['cards', cardId, 'month-total-amount', month, year],
        ['cards', cardId, 'total-amount-used'],
      ]
      await Promise.all(keys.map(key => queryClient.invalidateQueries({ queryKey: key })))
    },
  })
}
