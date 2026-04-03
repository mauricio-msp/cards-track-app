import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import { CreditCard } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { FieldDescription } from '@/components/ui/field'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()

    if (session) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/cards.track-light.png"
          alt="Background cards"
          className="absolute inset-0 h-full w-full object-cover dark:hidden"
        />

        <img
          src="/cards.track-dark.png"
          alt="Background cards"
          className="absolute inset-0 h-full w-full object-cover dark:block hidden"
        />
      </div>

      <div className="relative flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <CreditCard className="size-4" />
            </div>
            cards.track
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            <Outlet />

            <FieldDescription className="px-6 text-center">
              By clicking continue, you agree to our <br />
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </FieldDescription>
          </div>
        </div>

        <ModeToggle className="absolute bottom-3 self-center md:self-start" />
      </div>
    </div>
  )
}
