import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const Route = createFileRoute('/_auth/reset-password')({
  head: () => ({
    meta: [
      {
        title: 'reset password',
      },
    ],
  }),
  component: RouteComponent,
  validateSearch: z.object({
    token: z.string(),
  }),
})

function RouteComponent() {
  return <ResetPasswordForm />
}
