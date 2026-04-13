export interface IInstallmentsRepository {
  findByIdAndOwner(installmentId: string, userId: string): Promise<{ id: string } | null>
  findPaidByIdAndOwner(installmentId: string, userId: string): Promise<{ id: string } | null>
  markAsPaid(installmentId: string): Promise<Date>
  markAsUnpaid(installmentId: string): Promise<void>
}
