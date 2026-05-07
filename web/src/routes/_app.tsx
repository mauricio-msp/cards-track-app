import { createFileRoute, Link, Outlet, redirect, useMatches } from '@tanstack/react-router'
import React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()

    if (!session) {
      throw redirect({
        to: '/',
      })
    }

    return { ...session }
  },
  shouldReload: false,
  component: RouteComponent,
})

function RouteComponent() {
  const matches = useMatches()

  const breadcrumbs = matches
    // 🔥 só matches que realmente contribuem com crumbs
    .filter(match => Array.isArray(match.loaderData?.crumbs))
    // 🔥 só a branch atual
    .filter(
      match =>
        match.pathname === matches[matches.length - 1].pathname ||
        matches[matches.length - 1].pathname.startsWith(match.pathname),
    )
    .map(match => ({
      id: match.id,
      to: match.pathname,
      crumbs: match.loaderData!.crumbs,
    }))

  const flatCrumbs = breadcrumbs.flatMap(breadcrumb =>
    breadcrumb?.crumbs?.map((crumb: string | { label: string; to: string }, index: number) => {
      const label = typeof crumb === 'string' ? crumb : crumb.label
      const to = typeof crumb === 'string' ? breadcrumb.to : crumb.to
      return { label, to, key: `${breadcrumb.id}-${label}-${index}` }
    }),
  )

  const isFixedLayout = matches.some(m => m.routeId === '/_app/members/$id')

  return (
    <SidebarProvider
      data-layout={isFixedLayout ? 'fixed' : 'fluid'}
      className="data-[layout=fixed]:h-svh data-[layout=fixed]:overflow-hidden"
    >
      <AppSidebar />
      <SidebarInset
        data-layout={isFixedLayout ? 'fixed' : 'fluid'}
        className="min-w-0 data-[layout=fixed]:overflow-hidden"
      >
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {flatCrumbs.map((crumb, index) => {
                  const isLast = index === flatCrumbs.length - 1

                  return (
                    <React.Fragment key={crumb.key}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.to}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>

                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
