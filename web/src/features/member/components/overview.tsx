import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { BanknoteArrowDown, Link2, User } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PurchasesFilter } from '@/features/credit-card/components/purchases'
import { Details } from '@/features/member/components/details'
import { MemberError } from '@/features/member/components/error'
import { PurchasesByCard } from '@/features/member/components/purchases-by-card'
import { DetailsSkeleton, PurchasesByCardSkeleton } from '@/features/member/components/skeleton'
import { useIsMobile } from '@/hooks/use-mobile'

function CopyPublicLinkButton({ id }: { id: string }) {
  const isMobile = useIsMobile()

  function handleCopy() {
    const url = `${window.location.origin}/members/${id}/public`
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Link copiado!')
      })
      .catch(() => {
        toast.error('Não foi possível copiar o link')
      })
  }

  return (
    <Button variant="outline" onClick={handleCopy}>
      <Link2 />
      {!isMobile && 'Copiar link público'}
    </Button>
  )
}

export function MemberOverview() {
  const { id } = useParams({ from: '/_app/members/$id' })

  return (
    <div className="flex flex-col flex-1 gap-4 p-4 pt-0 overflow-hidden min-w-0">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <CopyPublicLinkButton id={id} />
        <PurchasesFilter />
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
                <Details memberId={id} />
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
                <PurchasesByCard memberId={id} />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </div>
    </div>
  )
}
