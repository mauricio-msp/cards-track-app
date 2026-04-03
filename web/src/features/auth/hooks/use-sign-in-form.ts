import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { authClient } from '@/lib/auth-client'

const SignInFormSchema = z.object({
  email: z.email('E-mail é obrigatório'),
  password: z.string().nonempty('Senha é obrigatória'),
})

export type SignInFormData = z.infer<typeof SignInFormSchema>

export function useSignInForm() {
  const [isLoadingWithGoogle, setIsLoadingWithGoogle] = useState(false)

  const form = useForm<SignInFormData>({
    resolver: zodResolver(SignInFormSchema),
  })

  const { handleSubmit, formState: { isSubmitting } } = form

  async function onSignIn({ email, password }: SignInFormData) {
    await authClient.signIn.email(
      {
        email,
        password,
        callbackURL: 'http://localhost:5173/dashboard',
      },
      {
        onError(context) {
          if (context.error) {
            toast.error(context.error.message)
          } else {
            console.error('Falha no processo de login.')
          }
        },
        onSuccess() {
          toast.success('Login realizado com sucesso!')
        },
      },
    )
  }

  async function onSignInWithGoogle() {
    setIsLoadingWithGoogle(true)

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: 'http://localhost:5173/dashboard',
      })
    } catch (error) {
      console.error('Erro ao entrar com o Google:', error)
    } finally {
      setIsLoadingWithGoogle(false)
    }
  }

  return {
    form,
    isSubmitting,
    isLoadingWithGoogle,
    onSubmit: handleSubmit(onSignIn),
    onSignInWithGoogle,
  }
}
