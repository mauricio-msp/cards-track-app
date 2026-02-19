import { CirclePlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export function MembersNavSkeleton() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="opacity-40">
        <Users className="mr-2" />
        Members (0)
        <Button disabled size="icon-sm" variant="ghost" className="ml-auto cursor-pointer">
          <CirclePlus />
        </Button>
      </SidebarGroupLabel>

      <SidebarMenu className="gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuButton className="h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="size-1 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
