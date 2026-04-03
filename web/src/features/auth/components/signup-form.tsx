import { Link } from '@tanstack/react-router'

import { Loader, UserRound } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { useSignUpForm } from '@/features/auth/hooks/use-sign-up-form'
import { cn } from '@/lib/utils'

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { form, isSubmitting, onSubmit } = useSignUpForm()
  const { register, formState: { errors } } = form

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Crie sua conta</CardTitle>
          <CardDescription>Digite seu e-mail abaixo para criar sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup className="gap-3.5">
              <Field className="gap-1">
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="João Silva"
                  {...register('name', { required: true })}
                />
                {errors.name && (
                  <FieldError className="text-destructive">{errors.name.message}</FieldError>
                )}
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  disabled={isSubmitting}
                  placeholder="m@example.com"
                  autoComplete="email"
                  {...register('email', { required: true })}
                />
                {errors.email && (
                  <FieldError className="text-destructive">{errors.email.message}</FieldError>
                )}
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  {...register('password', { required: true })}
                />
                {errors.password ? (
                  <FieldError className="text-destructive">{errors.password.message}</FieldError>
                ) : (
                  <FieldDescription>Deve ter pelo menos 8 caracteres.</FieldDescription>
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
                    <UserRound className="size-4" />
                  )}
                  {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                </Button>
                <FieldDescription className="text-center">
                  Já tem uma conta? <Link to="/">Entrar</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
