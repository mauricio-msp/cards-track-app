import { BanknoteX, HandCoins } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { CoveragesSummaryTotals } from '@/features/coverages-summary/components/coverages-summary-totals'
import { CoveragesTable } from '@/features/coverages-summary/components/coverages-table'
import { useAllCoverages } from '@/features/coverages-summary/hooks/use-all-coverages'
import { PurchasesFilter } from '@/features/credit-card/components/purchases/purchases-filter'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function CoveragesSummaryPage() {
  const { month, year } = usePurchasesFilter()
  const { data } = useAllCoverages({ month, year })

  return (
    <div className="flex flex-col gap-4 p-4 pt-0 flex-1">
      <PageHeader>
        <PageHeader.Icon>
          <HandCoins />
        </PageHeader.Icon>
        <PageHeader.Title>Coberturas</PageHeader.Title>
        <PageHeader.Description>
          Resumo de coberturas registradas por período.
        </PageHeader.Description>
        <PageHeader.Action>
          <PurchasesFilter />
        </PageHeader.Action>
      </PageHeader>

      <CoveragesSummaryTotals
        totalRepaid={data.totalRepaid}
        totalCovered={data.totalCovered}
        totalRemaining={data.totalRemaining}
      />

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Histórico de coberturas</CardTitle>
          <CardDescription>
            Todas as coberturas registradas, com detalhes de membro, cartão, período e valor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.coverages.length === 0 ? (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BanknoteX />
                </EmptyMedia>
                <EmptyTitle>Nenhuma cobertura</EmptyTitle>
                <EmptyDescription>
                  Nenhuma cobertura registrada para o período selecionado.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <CoveragesTable coverages={data.coverages} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
