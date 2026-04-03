import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'

import { createDebt } from '@/features/credit-card/api'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function useCreateDebt() {
  const queryClient = useQueryClient()
  const { id } = useParams({ from: '/_app/credit-card/$id' })
  const { month, year } = useDebtsFilter()

  return useMutation({
    mutationFn: createDebt,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cards', id, 'debts', month, year] }),
        queryClient.invalidateQueries({
          queryKey: ['cards', id, 'month-total-amount', month, year],
        }),
        queryClient.invalidateQueries({ queryKey: ['cards', id, 'total-amount-used'] }),
      ])
    },
    onError: error => {
      console.error('Failed to create debt:', error)
    },
  })
}
