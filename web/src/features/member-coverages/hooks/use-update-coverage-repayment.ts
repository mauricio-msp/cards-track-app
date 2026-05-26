import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateCoverageRepayment } from '@/features/member-coverages/api/update-coverage-repayment'
import { memberCoveragesQueryKey } from '@/features/member-coverages/hooks/use-member-coverages'

export function useUpdateCoverageRepayment(params: {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCoverageRepayment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberCoveragesQueryKey(
          params.memberId,
          params.cardId,
          params.targetMonth,
          params.targetYear,
        ),
      })
      toast.success('Quitação atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao atualizar quitação')
    },
  })
}
