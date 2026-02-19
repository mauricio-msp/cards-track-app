import { createFileRoute } from '@tanstack/react-router'
import { MemberOverview } from '@/components/members/member-overview'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createFileRoute('/_app/members/$id')({
  loader: () => ({ crumbs: ['Member', 'Overview'] }),
  head: () => ({
    meta: [
      {
        title: 'Member',
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
