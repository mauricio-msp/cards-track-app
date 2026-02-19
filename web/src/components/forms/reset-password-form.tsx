import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'

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

const ResetPasswordFormSchema = z
  .object({
    password: z.string('Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().nonempty('Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords doesn't match",
    path: ['confirmPassword'],
  })

type ResetPasswordFormTypeSchema = z.infer<typeof ResetPasswordFormSchema>

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate({ from: '/reset-password' })
  const searchParams = useSearch({ from: '/_auth/reset-password' })
  const token = searchParams.token

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ResetPasswordFormTypeSchema>({
    resolver: zodResolver(ResetPasswordFormSchema),
  })

  async function handleResetPassword({ password }: ResetPasswordFormTypeSchema) {
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    })

    if (error) {
      toast.error(error.message)
    } else {
      navigate({ to: '/' })
      toast.success('Password reset successfully!')
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleResetPassword)}>
            <FieldGroup>
              <Field className="gap-1">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <FieldError className="text-destructive">{errors.password.message}</FieldError>
                )}
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <FieldError className="text-destructive">
                    {errors.confirmPassword.message}
                  </FieldError>
                )}
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                  {isSubmitting ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="size-4" />
                  )}

                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
                <FieldDescription className="text-center">
                  Changed your mind? <Link to="/">Return to sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
