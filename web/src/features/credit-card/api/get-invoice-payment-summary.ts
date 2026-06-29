import { z } from 'zod'
import { apiRequest, apiUrl } from '@/lib/api-client'

const MemberSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  relationship: z.string(),
  totalOwed: z.coerce.number(),
  totalPaid: z.coerce.number(),
  remaining: z.coerce.number(),
  isLate: z.boolean().nullable(),
})

const GetInvoicePaymentSummaryResponse = z.object({
  invoiceTotal: z.coerce.number(),
  isPastPeriod: z.boolean(),
  members: z.array(MemberSummarySchema),
})

export type MemberSummary = z.infer<typeof MemberSummarySchema>
export type InvoicePaymentSummary = z.infer<typeof GetInvoicePaymentSummaryResponse>

export async function getInvoicePaymentSummary({
  id,
  month,
  year,
}: {
  id: string
  month?: number
  year?: number
}) {
  const url = apiUrl(`/api/cards/${id}/invoice-payment-summary`)
  if (month !== undefined) url.searchParams.set('month', String(month))
  if (year !== undefined) url.searchParams.set('year', String(year))
  const data = await apiRequest(url)
  return GetInvoicePaymentSummaryResponse.parse(data)
}
