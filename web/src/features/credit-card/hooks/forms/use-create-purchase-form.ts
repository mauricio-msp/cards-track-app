import { zodResolver } from '@hookform/resolvers/zod'
import { useParams } from '@tanstack/react-router'
import React from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { ParsedPurchaseAI } from '@/features/credit-card/api/parse-purchase-with-ai'
import { useParsePurchaseWithAI } from '@/features/credit-card/hooks/forms/use-parse-purchase-with-ai'
import { useCreatePurchase } from '@/features/credit-card/hooks/purchases/use-create-purchase'
import type { Member } from '@/features/member/api/get-members'
import { useMembers } from '@/features/member/hooks'
import { formatValueToCents } from '@/lib/utils'

const CreatePurchaseFormSchema = z.object({
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
  billingDay: z.number().int().min(1, 'Mínimo 1').max(31, 'Máximo 31').optional(),
})

export type CreatePurchaseFormValues = z.infer<typeof CreatePurchaseFormSchema>

const defaultValues: Partial<CreatePurchaseFormValues> = {
  members: [],
  category: '',
  description: '',
  purchaseDate: undefined,
  installmentsCount: 1,
}

export function useCreatePurchaseForm() {
  const { id: cardId } = useParams({ from: '/_app/credit-card/$id' })
  const { mutateAsync: createPurchaseFn, isPending } = useCreatePurchase(cardId)
  const {
    data: { members: membersStore },
  } = useMembers()
  const { mutateAsync: parsePurchaseFn, isPending: isParsing } = useParsePurchaseWithAI()

  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [installmentsEnabled, setInstallmentsEnabled] = React.useState(false)
  const [isRecurring, setIsRecurring] = React.useState(false)
  const [aiText, setAiText] = React.useState('')
  const [missingFields, setMissingFields] = React.useState<string[]>([])
  const [parsedFields, setParsedFields] = React.useState<ParsedPurchaseAI | null>(null)
  const [unknownMemberNames, setUnknownMemberNames] = React.useState<string[]>([])

  const form = useForm<CreatePurchaseFormValues>({
    resolver: zodResolver(CreatePurchaseFormSchema),
    defaultValues,
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
  const purchaseDate = form.watch('purchaseDate')

  React.useEffect(() => {
    if (purchaseDate) {
      form.setValue('billingDay', purchaseDate.getDate())
    }
  }, [purchaseDate, form])

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

  function handleFillFromAi(parsed: ParsedPurchaseAI) {
    if (parsed.description && !form.getValues('description')) {
      form.setValue('description', parsed.description)
    }

    if (parsed.purchaseDate && !form.getValues('purchaseDate')) {
      const [year, month, day] = parsed.purchaseDate.split('-').map(Number)
      form.setValue('purchaseDate', new Date(year, month - 1, day))
    }

    if (parsed.category && !form.getValues('category')) {
      form.setValue('category', parsed.category)
    }

    if (parsed.installmentsCount && parsed.installmentsCount > 1) {
      setInstallmentsEnabled(true)
      form.setValue('installmentsCount', parsed.installmentsCount)
    }

    if (parsed.isRecurring) {
      handleSetIsRecurring(true)
    }

    if (parsed.members && parsed.members.length > 0) {
      const validMembers = parsed.members.filter(pm => membersStore.some(m => m.id === pm.id))
      if (validMembers.length > 0) {
        replace(
          validMembers.map(pm => ({
            id: pm.id,
            name: pm.name,
            amount: pm.amount || '',
            startInstallment: pm.startInstallment ?? 1,
            endInstallment: pm.endInstallment ?? undefined,
          })),
        )
      }
    }
  }

  async function handleParsePurchase() {
    if (!aiText.trim()) return
    try {
      const result = await parsePurchaseFn({
        text: aiText,
        members: membersStore,
      })
      handleFillFromAi(result.parsed)
      setMissingFields(result.missing)
      setParsedFields(result.parsed)
      setUnknownMemberNames(result.unknownMemberNames)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      if (
        message.includes('429') ||
        message.toLowerCase().includes('quota') ||
        message.toLowerCase().includes('limit')
      ) {
        toast.error('Limite de IA atingido, tente em instantes.')
      } else {
        toast.error('Serviço de IA indisponível, tente novamente.')
      }
    }
  }

  function resetAll() {
    form.reset(defaultValues)
    form.clearErrors(['category', 'members'])
    setInstallmentsEnabled(false)
    setIsRecurring(false)
    setAiText('')
    setMissingFields([])
    setParsedFields(null)
    setUnknownMemberNames([])
  }

  function handleSetIsRecurring(value: boolean) {
    setIsRecurring(value)
    if (value) {
      setInstallmentsEnabled(false)
      form.setValue('installmentsCount', 1)
    }
  }

  async function onSubmit({
    category,
    description,
    members,
    purchaseDate,
    installmentsCount,
    billingDay,
  }: CreatePurchaseFormValues) {
    await createPurchaseFn({
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
      isRecurring,
      billingDay: isRecurring ? billingDay : undefined,
    })

    form.reset(defaultValues)
    form.clearErrors(['category', 'members'])
    setInstallmentsEnabled(false)
    setIsRecurring(false)
    setAiText('')
    setMissingFields([])
    setParsedFields(null)
    setUnknownMemberNames([])
  }

  return {
    form,
    fields,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    resetAll,

    calendar: {
      open: calendarOpen,
      setOpen: setCalendarOpen,
    },

    installments: {
      installmentsEnabled,
      setInstallmentsEnabled,
      installmentsCount,
      totalAmountInCents,
    },

    members: {
      membersStore,
      selectedMembersForCombobox,
      handleMembersChange,
    },

    recurring: {
      isRecurring,
      setIsRecurring: handleSetIsRecurring,
    },

    ai: {
      aiText,
      setAiText,
      isParsing,
      missingFields,
      parsedFields,
      unknownMemberNames,
      handleParsePurchase,
    },
  }
}
