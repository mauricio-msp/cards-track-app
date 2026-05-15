import { createFileRoute } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MemberPublicOverview } from '@/features/member/components/public-overview'

export const Route = createFileRoute('/members/$id/public')({
  head: () => ({
    meta: [{ title: 'Visualização pública' }],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <TooltipProvider>
      <MemberPublicOverview />
    </TooltipProvider>
  )
}
