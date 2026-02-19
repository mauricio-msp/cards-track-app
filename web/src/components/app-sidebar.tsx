import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Command, LayoutDashboard, Settings2 } from 'lucide-react'
import { type ComponentProps, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { CardsNav } from '@/components/navigates/cards-nav'
import { CardsNavError } from '@/components/navigates/error/cards-nav-error'
import { MembersNavError } from '@/components/navigates/error/members-nav-error'
import { MembersNav } from '@/components/navigates/members-nav'
import { MenuNav } from '@/components/navigates/menu-nav'
import { CardsNavSkeleton } from '@/components/navigates/skeleton/cards-nav-skeleton'
import { MembersNavSkeleton } from '@/components/navigates/skeleton/members-nav-skeleton'
import { UserNav } from '@/components/navigates/user-nav'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  navMenu: [
    {
      url: '/dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      url: '/settings',
      name: 'Settings',
      icon: Settings2,
    },
  ],
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Cards.Track Inc</span>
                  <span className="truncate text-xs text-muted-foreground">Application</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="divide-y">
        <MenuNav items={data.navMenu} />

        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={props => <CardsNavError title="My Credit Cards" {...props} />}
            >
              <Suspense fallback={<CardsNavSkeleton />}>
                <CardsNav />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>

        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={props => <MembersNavError title="Members" {...props} />}
            >
              <Suspense fallback={<MembersNavSkeleton />}>
                <MembersNav />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </SidebarContent>

      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  )
}
