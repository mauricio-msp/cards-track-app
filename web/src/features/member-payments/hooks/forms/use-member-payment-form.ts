import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateMemberPayment } from '@/features/member-payments/hooks/use-create-member-payment'
import { useUpdateMemberPayment } from '@/features/member-payments/hooks/use-update-member-payment'

const MemberPaymentFormSchema = z.object({
  // BRL masked string e.g. "1.500,00" — converted to cents on submit
  amount: z.string().min(1, 'Valor é obrigatório'),
  paidAt: z.date({ message: 'Data é obrigatória' }),
  description: z.string().min(1, 'Descrição é obrigatória').max(500),
})

export type MemberPaymentFormValues = z.infer<typeof MemberPaymentFormSchema>

export function parseBRLToCents(masked: string): number {
  return Math.round(Number(masked.replace(/\./g, '').replace(',', '.')) * 100)
}

export function centsToBRLMask(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type UseMemberPaymentFormParams = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  editingPaymentId?: string
  editingAmountCents?: number
  editingPaidAt?: string
  editingDescription?: string
  onSuccess?: () => void
}

const emptyValues = {
  amount: '',
  paidAt: undefined as unknown as Date,
  description: '',
}

export function useMemberPaymentForm({
  memberId,
  cardId,
  targetMonth,
  targetYear,
  editingPaymentId,
  editingAmountCents,
  editingPaidAt,
  editingDescription,
  onSuccess,
}: UseMemberPaymentFormParams) {
  const { mutateAsync: createPayment, isPending: isCreating } = useCreateMemberPayment({
    memberId,
    cardId,
    targetMonth,
    targetYear,
  })
  const { mutateAsync: updatePayment, isPending: isUpdating } = useUpdateMemberPayment({
    memberId,
    cardId,
    targetMonth,
    targetYear,
  })

  const form = useForm<MemberPaymentFormValues>({
    resolver: zodResolver(MemberPaymentFormSchema),
    defaultValues:
      editingPaymentId && editingAmountCents !== undefined && editingPaidAt && editingDescription
        ? {
            amount: centsToBRLMask(editingAmountCents),
            paidAt: new Date(editingPaidAt),
            description: editingDescription,
          }
        : emptyValues,
  })

  async function onSubmit(values: MemberPaymentFormValues) {
    const amountInCents = parseBRLToCents(values.amount)
    const paidAtISO = values.paidAt.toISOString()

    if (editingPaymentId) {
      await updatePayment({
        memberId,
        cardId,
        paymentId: editingPaymentId,
        amount: amountInCents,
        paidAt: paidAtISO,
        description: values.description,
      })
    } else {
      await createPayment({
        memberId,
        cardId,
        targetMonth,
        targetYear,
        amount: amountInCents,
        paidAt: paidAtISO,
        description: values.description,
      })
    }

    form.reset(emptyValues)
    onSuccess?.()
  }

  return {
    form,
    isPending: isCreating || isUpdating,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
