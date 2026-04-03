import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'

const ForgotPasswordFormSchema = z.object({
  email: z.email('E-mail é obrigatório'),
})

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordFormSchema>

export function useForgotPasswordForm() {
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordFormSchema),
  })

  const { handleSubmit, reset, formState: { isSubmitting } } = form

  async function onForgotPassword({ email }: ForgotPasswordFormData) {
    const { data, error } = await authClient.requestPasswordReset({
      email,
      redirectTo: 'http://localhost:5173/reset-password',
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(data.message)
    }

    reset({ email: '' })
  }

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit(onForgotPassword),
  }
}
