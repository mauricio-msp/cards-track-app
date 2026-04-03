import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCreateMember } from '@/features/member/hooks'

const CreateMemberFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').min(3, 'Nome deve ter no mínimo 3 caracteres'),
  relationship: z.string().min(1, 'Relacionamento é obrigatório'),
})

type CreateMemberForm = z.infer<typeof CreateMemberFormSchema>

const defaultValues: CreateMemberForm = {
  name: '',
  relationship: '',
}

export function useCreateMemberForm() {
  const { mutateAsync: createMemberFn, isPending } = useCreateMember()

  const form = useForm<CreateMemberForm>({
    resolver: zodResolver(CreateMemberFormSchema),
    defaultValues,
  })

  async function onSubmit({ name, relationship }: CreateMemberForm) {
    await createMemberFn({ name, relationship })
    form.reset(defaultValues)
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
