import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { CreditCard, TrendingUp, Users, Wallet } from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { DashboardCardError } from '@/components/dashboard/dashboard-card-error'
import { DashboardCardSkeleton } from '@/components/dashboard/dashboard-card-skeleton'
import { DebtsYearlyEvolutionChart } from '@/components/dashboard/debts-yearly-evolution-chart'
import { DebtsYearlyEvolutionChartSkeleton } from '@/components/dashboard/debts-yearly-evolution-chart-skeleton'
import { MonthHighestDebtsAmountCard } from '@/components/dashboard/month-highest-debts-amount-card'
import { MonthLowestDebtsAmountCard } from '@/components/dashboard/month-lowest-debts-amount-card'
import { MonthTotalDebtsAmountCard } from '@/components/dashboard/month-total-debts-amount'
import { TotalDebtsAmountCard } from '@/components/dashboard/total-debts-amount-card'

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

function RouteComponent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-[repeat(auto-fit,minmax(386px,1fr))]">
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={props => (
                <DashboardCardError title="Dívida Total" icon={Wallet} {...props} />
              )}
            >
              <Suspense fallback={<DashboardCardSkeleton />}>
                <TotalDebtsAmountCard />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={props => (
                <DashboardCardError title="Dívida Total (mês)" icon={CreditCard} {...props} />
              )}
            >
              <Suspense fallback={<DashboardCardSkeleton />}>
                <MonthTotalDebtsAmountCard />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={props => (
                <DashboardCardError title="Menor Dívida (mês)" icon={Users} {...props} />
              )}
            >
              <Suspense fallback={<DashboardCardSkeleton />}>
                <MonthLowestDebtsAmountCard />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallbackRender={props => (
                <DashboardCardError title="Maior Dívida (mês)" icon={TrendingUp} {...props} />
              )}
            >
              <Suspense fallback={<DashboardCardSkeleton />}>
                <MonthHighestDebtsAmountCard />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </div>

      <Suspense fallback={<DebtsYearlyEvolutionChartSkeleton />}>
        <DebtsYearlyEvolutionChart />
      </Suspense>
    </div>
  )
}
