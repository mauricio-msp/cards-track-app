import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function DebtItemSkeleton() {
  return (
    <div className="py-4 not-last:border-b flex items-center gap-4">
      {/* Icon */}
      <Skeleton className="size-10 rounded-lg" />

      {/* Description */}
      <div className="flex flex-col gap-2 w-full">
        <Skeleton className="h-5 w-48" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-1 w-24 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Amount */}
      <div className="ml-auto flex flex-col items-end gap-1">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  )
}

export function DebtsListSkeleton() {
  return (
    <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
      {/* Header */}
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent>
        {Array.from({ length: 4 }).map((_, index) => (
          <DebtItemSkeleton key={index} />
        ))}
      </CardContent>
    </Card>
  )
}
