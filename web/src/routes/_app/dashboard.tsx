import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { CreditCard, LayoutDashboard, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { PageHeader } from '@/components/page-header'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DashboardCardError,
  DashboardCardSkeleton,
  MonthHighestPurchasesAmountCard,
  MonthLowestPurchasesAmountCard,
  MonthTotalPurchasesAmountCard,
  PurchasesTrendChart,
  PurchasesTrendChartSkeleton,
  TotalPurchasesAmountCard,
} from '@/features/dashboard'
import { PurchasesTrendChartError } from '@/features/dashboard/components/chart/error'

export const Route = createFileRoute('/_app/dashboard')({
  loader: () => ({ crumbs: ['Dashboard'] }),
  head: () => ({
    meta: [
      {
        title: 'Painel',
      },
    ],
  }),
  component: RouteComponent,
})

interface GridCardProps {
  title: string
  icon: React.ElementType
  Component: React.ComponentType
}

function GridCardWrapper({ title, icon, Component }: GridCardProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={props => <DashboardCardError title={title} icon={icon} {...props} />}
        >
          <Suspense fallback={<DashboardCardSkeleton />}>
            <Component />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <PageHeader>
        <PageHeader.Icon>
          <LayoutDashboard />
        </PageHeader.Icon>
        <PageHeader.Title>Dashboard</PageHeader.Title>
        <PageHeader.Description>Visão geral das suas dívidas e tendências.</PageHeader.Description>
      </PageHeader>

      <ScrollArea
        type="auto"
        className="-mx-4 sm:mx-0"
        viewportClassName="px-4 scroll-px-4 lg:px-0 lg:scroll-px-0 snap-x snap-mandatory lg:snap-none"
      >
        <div className="flex lg:grid lg:grid-cols-4 gap-4 pb-3 lg:pb-0">
          <div className="min-w-72 snap-start *:h-full">
            <GridCardWrapper
              title="Dívida Total"
              icon={Wallet}
              Component={TotalPurchasesAmountCard}
            />
          </div>
          <div className="min-w-72 snap-start *:h-full">
            <GridCardWrapper
              title="Dívida Total (mês)"
              icon={CreditCard}
              Component={MonthTotalPurchasesAmountCard}
            />
          </div>
          <div className="min-w-72 snap-start *:h-full">
            <GridCardWrapper
              icon={TrendingDown}
              title="Menor Dívida (mês)"
              Component={MonthLowestPurchasesAmountCard}
            />
          </div>
          <div className="min-w-72 snap-start *:h-full">
            <GridCardWrapper
              icon={TrendingUp}
              title="Maior Dívida (mês)"
              Component={MonthHighestPurchasesAmountCard}
            />
          </div>
        </div>
      </ScrollArea>

      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary
            onReset={reset}
            fallbackRender={props => <PurchasesTrendChartError {...props} />}
          >
            <Suspense fallback={<PurchasesTrendChartSkeleton />}>
              <PurchasesTrendChart />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    </div>
  )
}
