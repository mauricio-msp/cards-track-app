import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateCard } from '@/features/credit-card/hooks'
import { formatValueToCents } from '@/lib/utils'

const CreateCardFormSchema = z.object({
  name: z.string().min(1, 'Selecione um cartão de crédito'),
  limit: z.string({ error: 'Limite é obrigatório' }).refine(value => {
    const cents = formatValueToCents(value)
    return cents !== null && cents > 0
  }, 'Informe um limite válido'),
  closingOffsetDays: z
    .number({ error: 'Dias de fechamento é obrigatório' })
    .positive('Dias de fechamento deve ser maior que zero'),
  dueDay: z
    .number({ error: 'Dia de vencimento é obrigatório' })
    .positive('Dia de vencimento deve ser maior que zero')
    .max(31, 'Dia de vencimento deve ser no máximo 31'),
})

type CreateCardForm = z.infer<typeof CreateCardFormSchema>

const defaultValues: CreateCardForm = {
  name: '',
  limit: '',
  closingOffsetDays: 0,
  dueDay: 0,
}

export function useCreateCardForm() {
  const { mutateAsync: createCardFn, isPending } = useCreateCard()

  const form = useForm<CreateCardForm>({
    resolver: zodResolver(CreateCardFormSchema),
    defaultValues,
  })

  async function onSubmit({ name, limit, closingOffsetDays, dueDay }: CreateCardForm) {
    const limitInCents = formatValueToCents(limit) ?? 0

    await createCardFn({
      name,
      limit: limitInCents,
      closingOffsetDays,
      dueDay,
    })

    form.reset(defaultValues)
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
