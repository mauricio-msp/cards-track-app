import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from '@tanstack/react-router'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { GetCardPurchasesItem } from '@/features/credit-card/api/get-card-purchases'
import { useUpdatePurchase } from '@/features/credit-card/hooks/purchases/use-update-purchase'
import type { Member } from '@/features/member/api/get-members'
import { useMembersStore } from '@/hooks/store/use-members-store'
import { formatValueToCents } from '@/lib/utils'

// Mesmo schema do create — ambos exigem os mesmos campos
const UpdatePurchaseFormSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  members: z
    .array(
      z
        .object({
          id: z.string(),
          name: z.string(),
          amount: z.string().min(1, 'Valor é obrigatório'),
          startInstallment: z
            .number('Deve ser um número')
            .int('Deve ser um número inteiro')
            .positive('Deve ser maior que zero'),
          endInstallment: z
            .number('Deve ser um número')
            .int('Deve ser um número inteiro')
            .positive('Deve ser maior que zero')
            .optional(),
        })
        .refine(
          data => {
            if (data.endInstallment && data.endInstallment < data.startInstallment) return false
            return true
          },
          {
            message: 'A parcela final não pode ser menor que a inicial',
            path: ['endInstallment'],
          },
        ),
    )
    .min(1, 'Selecione ao menos um membro'),
  category: z
    .string({ error: 'Selecione uma categoria' })
    .min(1, 'Selecione uma categoria')
    .refine(val => val !== null && val.length > 0, 'Selecione uma categoria'),
  purchaseDate: z.date({ error: 'Selecione a data da compra' }),
  installmentsCount: z
    .number({ error: 'Informe o número de parcelas' })
    .positive('Deve ser maior que zero'),
})

export type UpdatePurchaseFormValues = z.infer<typeof UpdatePurchaseFormSchema>

type Purchase = z.infer<typeof GetCardPurchasesItem>

export function useUpdatePurchaseForm(purchase: Purchase) {
  const { id: cardId } = useParams({ from: '/_app/credit-card/$id' })
  const { mutateAsync: updatePurchaseFn, isPending } = useUpdatePurchase(cardId)
  const membersStore = useMembersStore(state => state.members)

  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [installmentsEnabled, setInstallmentsEnabled] = React.useState(purchase.installmentsCount > 1)

  const form = useForm<UpdatePurchaseFormValues>({
    resolver: zodResolver(UpdatePurchaseFormSchema),
    // Popula o form com os dados existentes da despesa
    defaultValues: {
      description: purchase.description,
      category: purchase.category,
      purchaseDate: new Date(purchase.purchaseDate),
      installmentsCount: purchase.installmentsCount,
      members: purchase.members.map(member => ({
        id: member.id,
        name: member.name,
        // installmentAmount está em centavos → converte para string "0.00"
        amount: (member.installmentAmount / 100).toFixed(2),
        // TODO: o BE ainda não retorna startInstallment/endInstallment por membro.
        // Quando o endpoint de update retornar esses dados, mapear corretamente.
        startInstallment: 1,
        endInstallment: purchase.installmentsCount,
      })),
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'members',
    keyName: '_rhf_id',
  })

  const watchedMembers = form.watch('members')
  const installmentsCount = form.watch('installmentsCount') || 1

  const currentMembersIds = fields.map(f => f.id)
  const selectedMembersForCombobox = membersStore.filter(m => currentMembersIds.includes(m.id))

  const totalAmountInCents = watchedMembers.reduce((sum, member) => {
    const start = member.startInstallment
    const end = member.endInstallment ?? installmentsCount
    const installmentsInRange = Math.max(0, end - start + 1)
    const amountInCents = member.amount
      ? (formatValueToCents(member.amount) ?? 0) * installmentsInRange
      : 0
    return sum + amountInCents
  }, 0)

  function handleMembersChange(selected: Member[]) {
    replace(
      selected.map(m => {
        const existing = fields.find(f => f.id === m.id)
        return {
          id: m.id,
          name: m.name,
          amount: existing?.amount || '',
          startInstallment: existing?.startInstallment ?? 1,
          endInstallment: existing?.endInstallment ?? undefined,
        }
      }),
    )
  }

  async function onSubmit({
    category,
    description,
    members,
    purchaseDate,
    installmentsCount,
  }: UpdatePurchaseFormValues) {
    await updatePurchaseFn({
      pmId: purchase.purchaseMemberId,
      cardId,
      members: members.map(member => ({
        ...member,
        amount: (formatValueToCents(member.amount) ?? 0) * installmentsCount,
        startInstallment: member.startInstallment,
        endInstallment: member.endInstallment || installmentsCount,
      })),
      category,
      description,
      purchaseDate: new Date(purchaseDate),
      installmentsCount,
    } as Parameters<typeof updatePurchaseFn>[0])

    // TODO: fechar o dialog após sucesso (passar onSuccess callback ou usar estado externo)
  }

  return {
    form,
    fields,
    isPending,
    calendarOpen,
    setCalendarOpen,
    installmentsEnabled,
    setInstallmentsEnabled,
    installmentsCount,
    totalAmountInCents,
    membersStore,
    selectedMembersForCombobox,
    handleMembersChange,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
