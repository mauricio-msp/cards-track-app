import { BadgeDollarSign, Wallet } from 'lucide-react'
import React, { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HiddenValue } from '@/components/ui/hidden-value'
import { InvoicePaymentSummaryDialog } from '@/features/credit-card/components/invoice-payment-summary-dialog'
import { useCardPurchases, useInvoicePaymentSummary, useMonthTotalAmountCard } from '@/features/credit-card/hooks'
import { formatPrice } from '@/lib/utils'

function InvoicePaymentIndicator({ cardId }: { cardId: string }) {
  const { data } = useInvoicePaymentSummary(cardId)

  const hasLate = data.members.some(m => m.isLate === true)
  const hasSettled = data.members.some(m => m.isLate === false)
  const hasPayments = data.members.some(m => m.totalPaid > 0)

  if (!hasLate && !hasSettled && !hasPayments) return null

  const color = hasLate
    ? 'bg-amber-500'
    : hasSettled
      ? 'bg-green-500'
      : 'bg-blue-500'

  return <span className={`absolute top-1 right-1 size-1.5 rounded-full ${color}`} />
}

export function TotalAmount({ cardId }: { cardId: string }) {
  const [summaryOpen, setSummaryOpen] = React.useState(false)

  const {
    data: { totalAmountMonth },
  } = useMonthTotalAmountCard(cardId)

  const {
    data: { purchases },
  } = useCardPurchases(cardId)

  return (
    <>
      <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
        <CardHeader className="flex items-center">
          <CardTitle className="flex items-center gap-2">
            <BadgeDollarSign />
            Total da Fatura
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto shrink-0 relative"
            onClick={() => setSummaryOpen(true)}
            aria-label="Ver adiantamentos/pagamentos por membro"
          >
            <Wallet className="size-4" />
            <Suspense fallback={null}>
              <InvoicePaymentIndicator cardId={cardId} />
            </Suspense>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col mt-6 space-y-2">
          <HiddenValue className="w-40 h-9">
            <span className="text-3xl text-destructive font-bold">
              {formatPrice(totalAmountMonth / 100)}
            </span>
          </HiddenValue>
          <span className="text-sm text-muted-foreground">
            {purchases.length} despesa(s) registrada(s)
          </span>
        </CardContent>
      </Card>

      <InvoicePaymentSummaryDialog
        cardId={cardId}
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
      />
    </>
  )
}
