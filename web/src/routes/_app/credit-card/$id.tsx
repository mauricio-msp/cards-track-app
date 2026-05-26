import { createFileRoute } from '@tanstack/react-router'
import { Overview } from '@/features/credit-card/components/overview'

export const Route = createFileRoute('/_app/credit-card/$id')({
  loader: () => ({ crumbs: ['Cartão de Crédito'] }),
  head: () => ({
    meta: [
      {
        title: 'Cartão de Crédito',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return <Overview />
}
