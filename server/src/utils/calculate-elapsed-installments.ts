export function calculateElapsedInstallments(
  firstInvoiceMonth: number,
  firstInvoiceYear: number,
  installmentsCount: number,
  now: Date = new Date(),
): number {
  let elapsed = 0

  for (let i = 0; i < installmentsCount; i++) {
    const dueDateEnd = new Date(firstInvoiceYear, firstInvoiceMonth + i, 1)

    if (now > dueDateEnd) {
      elapsed++
    } else {
      break
    }
  }

  return elapsed
}
