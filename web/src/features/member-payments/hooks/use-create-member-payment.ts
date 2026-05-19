import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMemberPayment } from '@/features/member-payments/api/create-member-payment'
import { memberPaymentsQueryKey } from '@/features/member-payments/hooks/use-member-payments'

export function useCreateMemberPayment(params: {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMemberPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: memberPaymentsQueryKey(
          params.memberId,
          params.cardId,
          params.targetMonth,
          params.targetYear,
        ),
      })
      toast.success('Pagamento registrado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao registrar pagamento')
    },
  })
}
