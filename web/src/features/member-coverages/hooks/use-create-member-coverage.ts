import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMemberCoverage } from '@/features/member-coverages/api/create-member-coverage'
import { memberCoveragesQueryKey } from '@/features/member-coverages/hooks/use-member-coverages'

export function useCreateMemberCoverage(params: {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMemberCoverage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberCoveragesQueryKey(
          params.memberId,
          params.cardId,
          params.targetMonth,
          params.targetYear,
        ),
      })
      toast.success('Cobertura registrada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao registrar cobertura')
    },
  })
}
