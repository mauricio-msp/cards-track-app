import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'

import { Loader, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

const SignUpFormSchema = z
  .object({
    name: z.string('Name is required').min(3, 'Name must be at least 3 characters'),
    email: z.email('Invalid email address'),
    password: z.string('Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().nonempty('Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords doesn't match",
    path: ['confirmPassword'],
  })

type SignUpFormTypeSchema = z.infer<typeof SignUpFormSchema>

export function SignupForm({ className, ...props }: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<SignUpFormTypeSchema>({
    resolver: zodResolver(SignUpFormSchema),
  })

  async function handleSignUp({ name, email, password }: SignUpFormTypeSchema) {
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
          toast.success('Account created successfully. Check your email to complete verification.')
        },
      },
    )

    reset({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Enter your email below to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSignUp)}>
            <FieldGroup className="gap-3.5">
              <Field className="gap-1">
                <FieldLabel htmlFor="name">User Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="John Doe"
                  {...register('name', { required: true })}
                />
                {errors.name && (
                  <FieldError className="text-destructive">{errors.name.message}</FieldError>
                )}
              </Field>
              <Field className="gap-1">
                <FieldLabel htmlFor="email">Email</FieldLabel>
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
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
                  <FieldDescription>Must be at least 8 characters long.</FieldDescription>
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
                    <UserRound className="size-4" />
                  )}

                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/">Sign In</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
