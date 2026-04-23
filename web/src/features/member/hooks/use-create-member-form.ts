import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateMember } from '@/features/member/hooks'

const CreateMemberFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').min(3, 'Nome deve ter no mínimo 3 caracteres'),
  relationship: z.string().min(1, 'Relacionamento é obrigatório'),
  phone: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true
        return val.replace(/\D/g, '').length >= 10
      },
      { message: 'Telefone inválido' },
    ),
})

export type CreateMemberFormValues = z.infer<typeof CreateMemberFormSchema>

const defaultValues: CreateMemberFormValues = {
  name: '',
  relationship: '',
  phone: '',
}

export function useCreateMemberForm() {
  const { mutateAsync: createMemberFn, isPending } = useCreateMember()

  const form = useForm<CreateMemberFormValues>({
    resolver: zodResolver(CreateMemberFormSchema),
    defaultValues,
  })

  async function onSubmit({ name, relationship, phone }: CreateMemberFormValues) {
    const phoneE164 = phone ? `+55${phone.replace(/\D/g, '')}` : undefined
    await createMemberFn({ name, relationship, phone: phoneE164 })
    form.reset(defaultValues)
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
