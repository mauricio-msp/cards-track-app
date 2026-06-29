import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/features/settings/settings-page'

export const Route = createFileRoute('/_app/settings')({
  component: RouteComponent,
  loader: () => ({ crumbs: ['Configurações'] }),
  head: () => ({
    meta: [
      {
        title: 'Configurações',
      },
    ],
  }),
})

function RouteComponent() {
  return <SettingsPage />
}
