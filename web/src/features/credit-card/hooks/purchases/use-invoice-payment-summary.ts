import { useSuspenseQuery } from '@tanstack/react-query'
import { getInvoicePaymentSummary } from '@/features/credit-card/api/get-invoice-payment-summary'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function useInvoicePaymentSummary(cardId: string) {
  const { month, year } = usePurchasesFilter()

  return useSuspenseQuery({
    queryKey: ['cards', cardId, 'invoice-payment-summary', month, year],
    queryFn: () => getInvoicePaymentSummary({ id: cardId, month, year }),
    refetchOnWindowFocus: false,
  })
}
