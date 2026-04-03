import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { CreditCard, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import {
  DashboardCardError,
  DashboardCardSkeleton,
  DebtsTrendChart,
  DebtsTrendChartSkeleton,
  MonthHighestDebtsAmountCard,
  MonthLowestDebtsAmountCard,
  MonthTotalDebtsAmountCard,
  TotalDebtsAmountCard,
} from '@/features/dashboard'

export const Route = createFileRoute('/_app/dashboard')({
  loader: () => ({ crumbs: ['Dashboard', 'Overview'] }),
  head: () => ({
    meta: [
      {
        title: 'Dashboard',
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
      <div className="grid auto-rows-min gap-4 md:grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))]">
        <GridCardWrapper title="Dívida Total" icon={Wallet} Component={TotalDebtsAmountCard} />
        <GridCardWrapper
          title="Dívida Total (mês)"
          icon={CreditCard}
          Component={MonthTotalDebtsAmountCard}
        />
        <GridCardWrapper
          icon={TrendingDown}
          title="Menor Dívida (mês)"
          Component={MonthLowestDebtsAmountCard}
        />
        <GridCardWrapper
          icon={TrendingUp}
          title="Maior Dívida (mês)"
          Component={MonthHighestDebtsAmountCard}
        />
      </div>

      <Suspense fallback={<DebtsTrendChartSkeleton />}>
        <DebtsTrendChart />
      </Suspense>
    </div>
  )
}
