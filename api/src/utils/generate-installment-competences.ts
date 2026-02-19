export function generateInstallmentCompetences(
  invoiceMonth: number,
  invoiceYear: number,
  installmentsCount: number,
) {
  return Array.from({ length: installmentsCount }, (_, i) => {
    const d = new Date(invoiceYear, invoiceMonth + i, 1)

    return {
      month: d.getMonth(),
      year: d.getFullYear(),
    }
  })
}
