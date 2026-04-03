import { Link } from '@tanstack/react-router'

import { Loader, RefreshCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { useForgotPasswordForm } from '@/features/auth/hooks/use-forgot-password-form'
import { cn } from '@/lib/utils'

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { form, isSubmitting, onSubmit } = useForgotPasswordForm()
  const { register, formState: { errors } } = form

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Esqueci minha senha</CardTitle>
          <CardDescription>Digite seu e-mail abaixo para redefinir sua senha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field className="gap-1">
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
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
                  {isSubmitting ? 'Enviando e-mail...' : 'Redefinir senha'}
                </Button>
                <FieldDescription className="text-center">
                  Lembrou sua senha? <Link to="/">Voltar ao login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
