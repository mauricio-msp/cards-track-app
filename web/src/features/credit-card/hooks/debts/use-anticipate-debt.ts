import { useMutation, useQueryClient } from '@tanstack/react-query'
import { anticipateDebt } from '@/features/credit-card/api/anticipate-debt'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useAnticipateDebt(cardId: string) {
  const queryClient = useQueryClient()
  const { month, year } = useDebtsFilter()

  return useMutation({
    mutationFn: anticipateDebt,
    onSuccess: async () => {
      const keys = [
        ['cards', cardId, 'debts', month, year],
        ['cards', cardId, 'month-total-amount', month, year],
        ['cards', cardId, 'total-amount-used'],
      ]
      await Promise.all(keys.map(key => queryClient.invalidateQueries({ queryKey: key })))
    },
  })
}
