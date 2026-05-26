export class CoverageEntity {
  constructor(
    readonly id: string,
    readonly memberId: string,
    readonly cardId: string,
    readonly targetMonth: number,
    readonly targetYear: number,
    readonly amount: number,
    readonly coveredAt: Date,
    readonly description: string | null,
    readonly amountRepaid: number,
    readonly settledAt: Date | null,
    readonly createdAt: Date,
  ) {}
}
