import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

function MemberItemSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <Skeleton className="size-10 rounded-full" />

        {/* Name + relationship */}
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>

        {/* Amount */}
        <div className="flex flex-col items-end ml-auto gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>

      {/* Progress */}
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  )
}

export function DebtsMembersListSkeleton() {
  return (
    <Card className="h-max col-span-1 lg:col-span-2 xl:col-span-1 sticky top-4">
      {/* Header */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <MemberItemSkeleton key={index} />
        ))}

        <Separator />

        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-28" />
        </div>
      </CardContent>
    </Card>
  )
}
