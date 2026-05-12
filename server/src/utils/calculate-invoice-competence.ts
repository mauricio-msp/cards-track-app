export function calculateInvoiceCompetence(
  purchaseDate: Date,
  dueDay: number,
  closingOffsetDays: number,
) {
  // 1. Zeramos as horas da data de compra para comparação pura de dias
  const date = new Date(purchaseDate)
  date.setHours(0, 0, 0, 0)

  const year = date.getFullYear()
  const month = date.getMonth()

  // 2. Criamos o vencimento alvo (também zerado)
  let targetDue = new Date(year, month, dueDay, 0, 0, 0, 0)

  // 3. Calculamos o fechamento
  let closing = new Date(targetDue)
  closing.setDate(targetDue.getDate() - closingOffsetDays)
  closing.setHours(0, 0, 0, 0)

  // 4. Verificação lógica
  if (date >= closing || targetDue < date) {
    targetDue = new Date(year, month + 1, dueDay, 0, 0, 0, 0)

    // Recalculamos o fechamento do mês seguinte para casos extremos
    closing = new Date(targetDue)
    closing.setDate(targetDue.getDate() - closingOffsetDays)
    closing.setHours(0, 0, 0, 0)

    if (date >= closing) {
      targetDue = new Date(targetDue.getFullYear(), targetDue.getMonth() + 1, dueDay, 0, 0, 0, 0)
    }
  }

  return {
    invoiceMonth: targetDue.getMonth(), // Dezembro será 11
    invoiceYear: targetDue.getFullYear(),
  }
}
