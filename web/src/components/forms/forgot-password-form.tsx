import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'

import { Loader, RefreshCcw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const ForgotPasswordFormSchema = z.object({
  email: z.email('Email is required'),
})

type ForgotPasswordFormTypeSchema = z.infer<typeof ForgotPasswordFormSchema>

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<ForgotPasswordFormTypeSchema>({
    resolver: zodResolver(ForgotPasswordFormSchema),
  })

  async function handleForgotPassword({ email }: ForgotPasswordFormTypeSchema) {
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

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Forgot Password</CardTitle>
          <CardDescription>Enter your email below to reset your password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleForgotPassword)}>
            <FieldGroup>
              <Field className="gap-1">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  disabled={isSubmitting}
                  placeholder="m@example.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <FieldError className="text-destructive">{errors.email.message}</FieldError>
                )}
              </Field>

              <Field>
                <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                  {isSubmitting ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="size-4" />
                  )}

                  {isSubmitting ? 'Sending reset email...' : 'Reset Password'}
                </Button>
                <FieldDescription className="text-center">
                  Remembered your password? <Link to="/">Back to sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
