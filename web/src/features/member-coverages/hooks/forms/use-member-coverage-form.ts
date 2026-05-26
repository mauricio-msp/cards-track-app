import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateMemberCoverage } from '@/features/member-coverages/hooks/use-create-member-coverage'

const MemberCoverageFormSchema = z.object({
  amount: z.string().min(1, 'Valor é obrigatório'),
  coveredAt: z.date({ message: 'Data é obrigatória' }),
  description: z.string().max(500).optional(),
})

export type MemberCoverageFormValues = z.infer<typeof MemberCoverageFormSchema>

export function parseBRLToCents(masked: string): number {
  return Math.round(Number(masked.replace(/\./g, '').replace(',', '.')) * 100)
}

export function centsToBRLMask(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type UseMemberCoverageFormParams = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  prefillAmountCents?: number
  onSuccess?: () => void
}

const emptyValues = {
  amount: '',
  coveredAt: undefined as unknown as Date,
  description: '',
}

export function useMemberCoverageForm({
  memberId,
  cardId,
  targetMonth,
  targetYear,
  prefillAmountCents,
  onSuccess,
}: UseMemberCoverageFormParams) {
  const { mutateAsync: createCoverage, isPending } = useCreateMemberCoverage({
    memberId,
    cardId,
    targetMonth,
    targetYear,
  })

  const form = useForm<MemberCoverageFormValues>({
    resolver: zodResolver(MemberCoverageFormSchema),
    defaultValues:
      prefillAmountCents !== undefined
        ? { amount: centsToBRLMask(prefillAmountCents), coveredAt: undefined as unknown as Date, description: '' }
        : emptyValues,
  })

  async function onSubmit(values: MemberCoverageFormValues) {
    await createCoverage({
      memberId,
      cardId,
      targetMonth,
      targetYear,
      amount: parseBRLToCents(values.amount),
      coveredAt: values.coveredAt.toISOString(),
      description: values.description || undefined,
    })

    form.reset(emptyValues)
    onSuccess?.()
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
