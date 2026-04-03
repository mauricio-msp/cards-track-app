import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="size-5 rounded-sm" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-start justify-end gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}
