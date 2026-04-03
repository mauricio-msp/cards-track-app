import { Link } from '@tanstack/react-router'

import { Loader, LogIn } from 'lucide-react'

import { GoogleIcon } from '@/components/icons/google-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { useSignInForm } from '@/features/auth/hooks/use-sign-in-form'
import { cn } from '@/lib/utils'

export function SignInForm({ className, ...props }: React.ComponentProps<'div'>) {
  const { form, isSubmitting, isLoadingWithGoogle, onSubmit, onSignInWithGoogle } = useSignInForm()
  const { register, formState: { errors } } = form

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Entre na sua conta</CardTitle>
          <CardDescription>Digite seu e-mail abaixo para entrar na sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isSubmitting || isLoadingWithGoogle}
                  onClick={onSignInWithGoogle}
                  className="cursor-pointer"
                >
                  {isLoadingWithGoogle ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="size-5" />
                  )}
                  Entrar com Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Ou continue com
              </FieldSeparator>
              <Field className="gap-1">
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  disabled={isSubmitting || isLoadingWithGoogle}
                  placeholder="m@example.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <FieldError className="text-destructive">{errors.email.message}</FieldError>
                )}
              </Field>
              <Field className="gap-1">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  disabled={isSubmitting || isLoadingWithGoogle}
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <FieldError className="text-destructive">{errors.password.message}</FieldError>
                )}
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingWithGoogle}
                  className="cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <LogIn className="size-4" />
                  )}
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </Button>
                <FieldDescription className="text-center">
                  Não tem uma conta? <Link to="/sign-up">Cadastre-se</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
