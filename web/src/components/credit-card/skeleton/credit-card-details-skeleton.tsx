import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CreditCardDetailsSkeleton() {
  return (
    <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
      {/* Header */}
      <CardHeader className="flex items-center gap-2">
        <Skeleton className="size-12 rounded-xl" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>

        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>

      {/* Footer */}
      <CardFooter className="justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>

        <div />
      </CardFooter>
    </Card>
  )
}
