import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

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
