import { calculateInvoiceCompetence } from './calculate-invoice-competence'

export function isBillClosed(dueDay: number, closingOffsetDays: number): boolean {
  const now = new Date()
  const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(now, dueDay, closingOffsetDays)
  return invoiceMonth !== now.getMonth() || invoiceYear !== now.getFullYear()
}
