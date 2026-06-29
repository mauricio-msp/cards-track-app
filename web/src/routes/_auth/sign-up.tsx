import { createFileRoute } from '@tanstack/react-router'
import { SignupForm } from '@/features/auth/components/signup-form'

export const Route = createFileRoute('/_auth/sign-up')({
  head: () => ({
    meta: [
      {
        title: 'Criar conta',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <SignupForm />
}
