import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

function DebtItemSkeleton() {
  return (
    <div className="py-4 px-2 flex gap-4 bg-background rounded-xl border border-accent">
      <div className="flex flex-col flex-1 gap-2 min-w-0">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>

      <div className="ml-auto flex flex-col items-end gap-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

function MemberDebtCardSkeleton() {
  return (
    <Card>
      {/* Header */}
      <CardHeader className="flex items-center gap-2">
        <Skeleton className="size-12 rounded-xl" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent>
        <Separator className="mb-4" />

        <div className="space-y-2">
          <DebtItemSkeleton />
          <DebtItemSkeleton />
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="mt-auto border-t justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-6 w-24" />
      </CardFooter>
    </Card>
  )
}

export function MemberDebtsCardSkeleton() {
  return (
    <div className="grid auto-rows-min grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <MemberDebtCardSkeleton key={index} />
      ))}
    </div>
  )
}
