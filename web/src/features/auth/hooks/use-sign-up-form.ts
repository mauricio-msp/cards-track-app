import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'

const SignUpFormSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.email('E-mail inválido'),
    password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().nonempty('Por favor, confirme sua senha'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof SignUpFormSchema>

export function useSignUpForm() {
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(SignUpFormSchema),
  })

  const { handleSubmit, reset, formState: { isSubmitting } } = form

  async function onSignUp({ name, email, password }: SignUpFormData) {
    await authClient.signUp.email(
      {
        name,
        email,
        password,
        callbackURL: 'http://localhost:5173/dashboard',
      },
      {
        onError(context) {
          if (context.error) {
            toast.error(context.error.message)
          } else {
            console.error('Falha no processo de criação de conta.')
          }
        },
        onSuccess() {
          toast.success('Conta criada com sucesso. Verifique seu e-mail para completar a verificação.')
        },
      },
    )

    reset({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit(onSignUp),
  }
}
