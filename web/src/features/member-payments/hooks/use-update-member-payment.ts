import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateMemberPayment } from '@/features/member-payments/api/update-member-payment'
import { memberPaymentsQueryKey } from '@/features/member-payments/hooks/use-member-payments'

export function useUpdateMemberPayment(params: {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMemberPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberPaymentsQueryKey(
          params.memberId,
          params.cardId,
          params.targetMonth,
          params.targetYear,
        ),
      })
      toast.success('Pagamento atualizado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao atualizar pagamento')
    },
  })
}
