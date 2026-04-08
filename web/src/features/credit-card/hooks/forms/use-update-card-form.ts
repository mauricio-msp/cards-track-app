import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useUpdateCard } from '@/features/credit-card/hooks'
import { formatValueToCents } from '@/lib/utils'

const UpdateCardFormSchema = z.object({
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

export type UpdateCardFormValues = z.infer<typeof UpdateCardFormSchema>

type CardDefaults = {
  id: string
  name: string
  limit: number
  closingOffsetDays: number
  dueDay: number
}

function limitToDisplay(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function useUpdateCardForm(card: CardDefaults, onSuccess?: () => void) {
  const { mutateAsync: updateCardFn, isPending } = useUpdateCard()

  const form = useForm<UpdateCardFormValues>({
    resolver: zodResolver(UpdateCardFormSchema),
    defaultValues: {
      limit: limitToDisplay(card.limit),
      closingOffsetDays: card.closingOffsetDays,
      dueDay: card.dueDay,
    },
  })

  function resetToCard() {
    form.reset({
      limit: limitToDisplay(card.limit),
      closingOffsetDays: card.closingOffsetDays,
      dueDay: card.dueDay,
    })
  }

  async function onSubmit({ limit, closingOffsetDays, dueDay }: UpdateCardFormValues) {
    const limitInCents = formatValueToCents(limit) ?? 0

    await updateCardFn({
      id: card.id,
      limit: limitInCents,
      closingOffsetDays,
      dueDay,
    })

    onSuccess?.()
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    resetToCard,
  }
}
