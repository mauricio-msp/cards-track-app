import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MemberOverview } from '@/features/member/components/overview'

export const Route = createFileRoute('/_app/members/$id')({
  validateSearch: z.object({
    coverageCardId: z.string().optional(),
    coverageMonth: z.coerce.number().optional(),
    coverageYear: z.coerce.number().optional(),
    month: z.coerce.number().optional(),
    year: z.coerce.number().optional(),
  }),
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
