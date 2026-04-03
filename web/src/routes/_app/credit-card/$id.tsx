import { createFileRoute } from '@tanstack/react-router'
import { Overview } from '@/features/credit-card/components/overview'

export const Route = createFileRoute('/_app/credit-card/$id')({
  loader: () => ({ crumbs: ['Credit Card', 'Overview'] }),
  head: () => ({
    meta: [
      {
        title: 'Credit Card',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <Overview />
}
