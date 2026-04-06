import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export function SettingsHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Skeleton className="size-5 rounded" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-4 w-72 mt-1" />
      </div>
      <div className="flex items-center gap-2 pt-1 shrink-0">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </div>
  )
}

function CardRowSkeleton({ hasAvatar }: { hasAvatar?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton
        className={hasAvatar ? 'size-9 rounded-full shrink-0' : 'size-9 rounded-lg shrink-0'}
      />
      <div className="flex flex-col flex-1 min-w-0 gap-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function CardsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="justify-items-start">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-56 mt-1" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            {i > 0 && <Separator />}
            <CardRowSkeleton />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function MembersCardSkeleton() {
  return (
    <Card>
      <CardHeader className="justify-items-start">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-64 mt-1" />
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            {i > 0 && <Separator />}
            <CardRowSkeleton hasAvatar />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
