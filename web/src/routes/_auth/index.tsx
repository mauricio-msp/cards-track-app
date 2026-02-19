import { createFileRoute } from '@tanstack/react-router'
import { SignInForm } from '@/components/forms/signin-form'

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
