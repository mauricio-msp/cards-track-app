import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function CreditCardTotalAmountSkeleton() {
  return (
    <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
      {/* Header */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col mt-6 space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-48" />
      </CardContent>
    </Card>
  )
}
