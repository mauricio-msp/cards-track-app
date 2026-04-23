import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useUpdateMember } from '@/features/member/hooks/use-update-member'
import { applyPhoneMask } from '@/lib/utils'

const UpdateMemberFormSchema = z.object({
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

export type UpdateMemberFormValues = z.infer<typeof UpdateMemberFormSchema>

type MemberDefaults = {
  id: string
  relationship: string
  phone?: string | null
}

function phoneToMasked(e164?: string | null): string {
  if (!e164) return ''
  return applyPhoneMask(e164.replace(/\D/g, '').slice(2))
}

export function useUpdateMemberForm(member: MemberDefaults, onSuccess?: () => void) {
  const { mutateAsync: updateMemberFn, isPending } = useUpdateMember()

  const form = useForm<UpdateMemberFormValues>({
    resolver: zodResolver(UpdateMemberFormSchema),
    defaultValues: {
      relationship: member.relationship,
      phone: phoneToMasked(member.phone),
    },
  })

  function resetToMember() {
    form.reset({
      relationship: member.relationship,
      phone: phoneToMasked(member.phone),
    })
  }

  async function onSubmit({ relationship, phone }: UpdateMemberFormValues) {
    const phoneE164 = phone ? `+55${phone.replace(/\D/g, '')}` : undefined
    await updateMemberFn({ memberId: member.id, relationship, phone: phoneE164 })
    onSuccess?.()
  }

  return {
    form,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    resetToMember,
  }
}
