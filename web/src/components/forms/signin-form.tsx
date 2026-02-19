import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'

import { Loader, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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

import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const SignInFormSchema = z.object({
  email: z.email('Email is required'),
  password: z.string().nonempty('Password is required'),
})

type SignInFormTypeSchema = z.infer<typeof SignInFormSchema>

export function SignInForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [isLoadingWithGoogle, setIsLoadingWithGoogle] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignInFormTypeSchema>({
    resolver: zodResolver(SignInFormSchema),
  })

  async function handleSignIn({ email, password }: SignInFormTypeSchema) {
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
            console.log('Falha no processo de login.')
          }
        },
        onSuccess() {
          toast.success('Signed in successfully!')
        },
      },
    )
  }

  async function handleSignInWithGoogle() {
    setIsLoadingWithGoogle(true)

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: 'http://localhost:5173/dashboard',
      })
    } catch (error) {
      console.error('Error during Google sign-in:', error)
    } finally {
      setIsLoadingWithGoogle(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSignIn)}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isSubmitting || isLoadingWithGoogle}
                  onClick={handleSignInWithGoogle}
                  className="cursor-pointer"
                >
                  {isLoadingWithGoogle ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="size-5" />
                  )}
                  Login with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="gap-1">
                <FieldLabel htmlFor="email">Email</FieldLabel>
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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
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

                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
                <FieldDescription className="text-center">
                  Don't have an account? <Link to="/sign-up">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
