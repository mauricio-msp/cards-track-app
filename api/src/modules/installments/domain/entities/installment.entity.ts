export class InstallmentEntity {
  constructor(
    readonly id: string,
    readonly number: number,
    readonly amount: number,
    readonly paidAt: Date | null,
  ) {}

  isPaid(): boolean {
    return this.paidAt !== null
  }
}
