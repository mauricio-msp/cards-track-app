import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

export const Route = createFileRoute('/_auth/forgot-password')({
  head: () => ({
    meta: [
      {
        title: 'forgot password',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <ForgotPasswordForm />
}
