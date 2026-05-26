import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteMemberCoverage } from '@/features/member-coverages/api/delete-member-coverage'
import { memberCoveragesQueryKey } from '@/features/member-coverages/hooks/use-member-coverages'

export function useDeleteMemberCoverage(params: {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMemberCoverage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberCoveragesQueryKey(
          params.memberId,
          params.cardId,
          params.targetMonth,
          params.targetYear,
        ),
      })
      toast.success('Cobertura removida com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao remover cobertura')
    },
  })
}
