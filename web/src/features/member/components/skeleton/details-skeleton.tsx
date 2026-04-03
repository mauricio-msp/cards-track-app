import { Skeleton } from '@/components/ui/skeleton'

export function DetailsSkeleton() {
  return (
    <header className="flex items-center gap-2">
      <Skeleton className="size-12 rounded-xl" />

      <div className="flex flex-col gap-1">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
    </header>
  )
}
