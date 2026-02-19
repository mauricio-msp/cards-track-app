import '@/index.css'

import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
// Import the generated route tree
import { routeTree } from '@/routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

router.subscribe('onResolved', () => {
  const matches = router.state.matches

  const titles = matches
    .flatMap(m => m.meta ?? [])
    .reverse()
    .map(m => m?.title)
    .filter(Boolean)

  const appName = titles[0]
  const pageTitle = titles[1]

  document.title = pageTitle ? `${appName} | ${pageTitle}` : (appName ?? '')
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="@cards.track:theme">
        <RouterProvider router={router} />
        <Toaster position="bottom-right" duration={4000} />
      </ThemeProvider>
    </StrictMode>,
  )
}
