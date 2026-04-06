import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useUpdateCard } from '@/features/credit-card/hooks'
import { formatValueToCents } from '@/lib/utils'

const UpdateCardFormSchema = z.object({
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

export type UpdateCardFormValues = z.infer<typeof UpdateCardFormSchema>

// O card completo (com closingOffsetDays e dueDay) precisa vir do endpoint GET /api/cards/:id.
// A listagem GET /api/cards retorna apenas { id, name, limit }.
// Ao montar o UpdateCardForm no settings, use useCard(cardId) para obter os dados completos.
type CardDefaults = {
  id: string
  name: string
  limit: number
  closingOffsetDays: number
  dueDay: number
}

export function useUpdateCardForm(card: CardDefaults) {
  const { mutateAsync: updateCardFn, isPending } = useUpdateCard()

  const form = useForm<UpdateCardFormValues>({
    resolver: zodResolver(UpdateCardFormSchema),
    defaultValues: {
      name: card.name,
      limit: (card.limit / 100).toFixed(2),
      closingOffsetDays: card.closingOffsetDays,
      dueDay: card.dueDay,
    },
  })

  async function onSubmit({ name, limit, closingOffsetDays, dueDay }: UpdateCardFormValues) {
    const limitInCents = formatValueToCents(limit) ?? 0

    await updateCardFn({
      id: card.id,
      name,
      limit: limitInCents,
      closingOffsetDays,
      dueDay,
    })

    // TODO: fechar o dialog após sucesso (passar onSuccess callback ou usar estado externo)
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
