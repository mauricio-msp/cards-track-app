import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteMemberPayment } from '@/features/member-payments/api/delete-member-payment'
import { memberPaymentsQueryKey } from '@/features/member-payments/hooks/use-member-payments'

export function useDeleteMemberPayment(params: {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMemberPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberPaymentsQueryKey(
          params.memberId,
          params.cardId,
          params.targetMonth,
          params.targetYear,
        ),
      })
      toast.success('Pagamento removido com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao remover pagamento')
    },
  })
}
