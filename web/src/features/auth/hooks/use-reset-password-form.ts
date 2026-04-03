import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'

const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().nonempty('Por favor, confirme sua senha'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof ResetPasswordFormSchema>

export function useResetPasswordForm() {
  const navigate = useNavigate({ from: '/reset-password' })
  const searchParams = useSearch({ from: '/_auth/reset-password' })
  const token = searchParams.token

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordFormSchema),
  })

  const { handleSubmit, formState: { isSubmitting } } = form

  async function onResetPassword({ password }: ResetPasswordFormData) {
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    })

    if (error) {
      toast.error(error.message)
    } else {
      navigate({ to: '/' })
      toast.success('Senha redefinida com sucesso!')
    }
  }

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit(onResetPassword),
  }
}
