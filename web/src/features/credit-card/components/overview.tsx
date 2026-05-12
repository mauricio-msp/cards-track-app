import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'

import { ArrowLeft, BadgeDollarSign, CreditCard, Landmark, PlusCircle, User } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import { PurchasesFilter, PurchasesList, PurchasesMembersList } from '@/features/credit-card/components/purchases'
import {
  PurchasesListSkeleton,
  PurchasesMembersListSkeleton,
} from '@/features/credit-card/components/purchases/skeleton'
import { Details } from '@/features/credit-card/components/details'
import { CardError } from '@/features/credit-card/components/error/card-error'
import { CreatePurchaseForm } from '@/features/credit-card/components/forms'
import { DetailsSkeleton, TotalAmountSkeleton } from '@/features/credit-card/components/skeleton'
import { TotalAmount } from '@/features/credit-card/components/total-amount'
import { useIsMobile } from '@/hooks/use-mobile'

export function Overview() {
  const { id } = useParams({ from: '/_app/credit-card/$id' })
  const isMobile = useIsMobile()
  const isDesktop = !isMobile

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" className="self-start cursor-pointer" asChild>
          <Link to="/dashboard">
            <ArrowLeft />
            {isDesktop && 'Voltar para o dashboard'}
          </Link>
        </Button>

        <PurchasesFilter />
      </div>

      <ScrollArea
        type="auto"
        className="-mx-4 sm:mx-0"
        viewportClassName="px-4 scroll-px-4 lg:px-0 lg:scroll-px-0 snap-x snap-mandatory lg:snap-none"
      >
        <div className="flex lg:grid lg:grid-cols-4 gap-4 pb-3 lg:pb-0">
          <div className="min-w-80 shrink-0 snap-start lg:col-span-3 *:h-full">
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  onReset={reset}
                  fallbackRender={props => (
                    <CardError
                      title="Detalhes do Cartão"
                      icon={Landmark}
                      className="col-span-1 lg:col-span-2 xl:col-span-3"
                      {...props}
                    />
                  )}
                >
                  <Suspense fallback={<DetailsSkeleton />}>
                    <Details cardId={id} />
                  </Suspense>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </div>
          <div className="min-w-80 shrink-0 snap-start lg:col-span-1 *:h-full">
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary
                  onReset={reset}
                  fallbackRender={props => (
                    <CardError
                      title="Total da Fatura"
                      icon={BadgeDollarSign}
                      className="col-span-1 lg:col-span-2 xl:col-span-1"
                      {...props}
                    />
                  )}
                >
                  <Suspense fallback={<TotalAmountSkeleton />}>
                    <TotalAmount cardId={id} />
                  </Suspense>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          </div>
        </div>
      </ScrollArea>

      <CreatePurchaseForm>
        <Button variant="outline" className="md:self-start my-3 cursor-pointer">
          <PlusCircle />
          Adicionar despesa
        </Button>
      </CreatePurchaseForm>

      <div className="flex-1 grid auto-rows-min gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={props => (
                <CardError
                  title="Despesas do Cartão"
                  icon={CreditCard}
                  className="col-span-1 lg:col-span-2 xl:col-span-3 sm:border"
                  {...props}
                />
              )}
            >
              <Suspense fallback={<PurchasesListSkeleton />}>
                <PurchasesList cardId={id} />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>

        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={props => (
                <CardError title="Total por Pessoa" icon={User} {...props} />
              )}
            >
              <Suspense fallback={<PurchasesMembersListSkeleton />}>
                <PurchasesMembersList cardId={id} />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </div>
    </div>
  )
}
