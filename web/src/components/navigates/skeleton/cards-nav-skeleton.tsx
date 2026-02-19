import { CirclePlus, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export function CardsNavSkeleton() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="opacity-40">
        <CreditCard className="mr-2" />
        My Credit Cards (0)
        <Button disabled size="icon-sm" variant="ghost" className="ml-auto cursor-pointer">
          <CirclePlus />
        </Button>
      </SidebarGroupLabel>

      <SidebarMenu>
        {Array.from({ length: 3 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton className="h-auto hover:bg-transparent">
              <Skeleton className="size-5 rounded-full" />

              <div className="flex flex-1 items-center justify-between gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
