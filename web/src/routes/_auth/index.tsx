import { createFileRoute } from '@tanstack/react-router'
import { SignInForm } from '@/features/auth/components/signin-form'

export const Route = createFileRoute('/_auth/')({
  head: () => ({
    meta: [
      {
        title: 'sign in',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <SignInForm />
}
