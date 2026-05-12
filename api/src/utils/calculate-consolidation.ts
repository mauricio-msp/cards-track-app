export type ConsolidationResult = {
  consolidatedCount: number
  remainingInstallments: number
}

export function calculateConsolidation(
  amount: number,
  pmInstallmentAmount: number,
  installmentsCount: number,
  currentInstallment: number,
): ConsolidationResult {
  const rawCount =
    pmInstallmentAmount > 0 ? Math.round(amount / pmInstallmentAmount) : 0
  const consolidatedCount =
    Number.isFinite(rawCount) && rawCount > 0
      ? rawCount
      : installmentsCount - currentInstallment + 1
  return {
    consolidatedCount,
    remainingInstallments: Math.max(
      installmentsCount - (currentInstallment + consolidatedCount - 1),
      0,
    ),
  }
}
