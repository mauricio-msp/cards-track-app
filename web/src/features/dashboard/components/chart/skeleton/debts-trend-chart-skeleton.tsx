import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DebtsTrendChartSkeleton() {
  return (
    <Card className="flex-1">
      <CardHeader className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>

        <Skeleton className="h-9 w-32 rounded-md" />
      </CardHeader>

      <CardContent className="h-full">
        <div className="aspect-auto size-full rounded-lg border border-dashed border-muted flex items-center justify-center">
          <div className="w-full h-full p-6 space-y-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-10/12" />
            <Skeleton className="h-3 w-9/12" />

            <div className="flex justify-between pt-6">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
