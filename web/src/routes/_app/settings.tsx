import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/features/settings/settings-page'

export const Route = createFileRoute('/_app/settings')({
  component: RouteComponent,
  loader: () => ({ crumbs: [{ label: 'Home', to: '/dashboard' }, 'Configurações'] }),
  head: () => ({
    meta: [
      {
        title: 'Settings',
      },
    ],
  }),
})

function RouteComponent() {
  return <SettingsPage />
}
