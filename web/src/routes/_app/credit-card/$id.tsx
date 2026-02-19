import { createFileRoute } from '@tanstack/react-router'
import { CreditCardOverview } from '@/components/credit-card/credit-card-overview'

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
  return <CreditCardOverview />
}
