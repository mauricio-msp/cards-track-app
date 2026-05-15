import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { BanknoteArrowDown, User } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PublicPurchasesFilter } from '@/features/credit-card/components/purchases/public-purchases-filter'
import { MemberError } from '@/features/member/components/error'
import { PublicDetails } from '@/features/member/components/public-details'
import { PublicPurchasesByCard } from '@/features/member/components/purchases-by-card'
import { DetailsSkeleton, PurchasesByCardSkeleton } from '@/features/member/components/skeleton'

export function MemberPublicOverview() {
  const { id } = useParams({ from: '/members/$id/public' })

  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex h-16 shrink-0 items-center justify-between px-4 border-b">
        <span className="font-semibold">cards.tracks</span>
        <Badge variant="secondary">Visualização pública</Badge>
      </header>

      <div className="flex flex-col flex-1 gap-4 p-4 overflow-hidden min-w-0">
        <div className="flex items-center justify-end shrink-0">
          <PublicPurchasesFilter />
        </div>

        <div className="shrink-0">
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={props => (
                  <MemberError title="Detalhes do Membro" icon={User} {...props} />
                )}
              >
                <Suspense fallback={<DetailsSkeleton />}>
                  <PublicDetails memberId={id} />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </div>

        <Separator className="shrink-0" />

        <div className="flex-1 min-h-0 flex flex-col">
          <QueryErrorResetBoundary>
            {({ reset }) => (
              <ErrorBoundary
                onReset={reset}
                fallbackRender={props => (
                  <MemberError title="Dívidas por Cartão" icon={BanknoteArrowDown} {...props} />
                )}
              >
                <Suspense fallback={<PurchasesByCardSkeleton />}>
                  <PublicPurchasesByCard memberId={id} />
                </Suspense>
              </ErrorBoundary>
            )}
          </QueryErrorResetBoundary>
        </div>
      </div>
    </div>
  )
}
