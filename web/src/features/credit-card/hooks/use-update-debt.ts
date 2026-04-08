import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { updateDebt } from '@/features/credit-card/api'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useUpdateDebt() {
  const queryClient = useQueryClient()
  const { id } = useParams({ from: '/_app/credit-card/$id' })
  const { month, year } = useDebtsFilter()

  return useMutation({
    mutationFn: updateDebt,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards', id, 'debts', month, year] }),
        queryClient.invalidateQueries({
          queryKey: ['cards', id, 'month-total-amount', month, year],
        }),
        queryClient.invalidateQueries({ queryKey: ['cards', id, 'total-amount-used'] }),
      ])
    },
    onError: (error: Error) => {
      console.error('Failed to update debt:', error)
    },
  })
}
