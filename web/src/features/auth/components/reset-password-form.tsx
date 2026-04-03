import { Link } from '@tanstack/react-router'

import { Loader, RefreshCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { useResetPasswordForm } from '@/features/auth/hooks/use-reset-password-form'
import { cn } from '@/lib/utils'

export function ResetPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { form, isSubmitting, onSubmit } = useResetPasswordForm()
  const { register, formState: { errors } } = form

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Redefinir Senha</CardTitle>
          <CardDescription>Digite sua nova senha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field className="gap-1">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  {...register('password')}
                />
                {errors.password && (
                  <FieldError className="text-destructive">{errors.password.message}</FieldError>
                )}
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="confirm-password">Confirmar Senha</FieldLabel>
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
                  {isSubmitting ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>
                <FieldDescription className="text-center">
                  Mudou de ideia? <Link to="/">Voltar ao login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
