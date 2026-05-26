import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { ChatWidget } from '@/features/ai-chat/components/chat-widget'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'My App is a web application',
      },
      {
        title: 'cards.tracks',
      },
    ],
  }),
  component: RootComponent,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
    },
  },
})

function RootComponent() {
  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <ChatWidget />
      </QueryClientProvider>
    </NuqsAdapter>
  )
}
