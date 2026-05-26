import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { CoveragesSummaryPage } from '@/features/coverages-summary/components/coverages-summary-page'

export const Route = createFileRoute('/_app/coverages')({
  loader: () => ({ crumbs: ['Coberturas'] }),
  head: () => ({
    meta: [{ title: 'Coberturas' }],
  }),
  component: RouteComponent,
})

function CoveragesSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(['coberto', 'recebido', 'pendente'] as const).map(key => (
          <Card key={key}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="size-5 rounded-sm" />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-start justify-end">
              <Skeleton className="h-8 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {(['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] as const).map(key => (
            <Skeleton key={key} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RouteComponent() {
  return (
    <Suspense fallback={<CoveragesSkeleton />}>
      <CoveragesSummaryPage />
    </Suspense>
  )
}
