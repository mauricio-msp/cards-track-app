import { createFileRoute } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MemberOverview } from '@/features/member/components/overview'

export const Route = createFileRoute('/_app/members/$id')({
  loader: () => ({ crumbs: ['Membro'] }),
  head: () => ({
    meta: [
      {
        title: 'Membros',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <TooltipProvider>
      <MemberOverview />
    </TooltipProvider>
  )
}
