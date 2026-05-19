export class MemberPaymentEntity {
  constructor(
    readonly id: string,
    readonly memberId: string,
    readonly cardId: string,
    readonly targetMonth: number,
    readonly targetYear: number,
    readonly amount: number,
    readonly paidAt: Date,
    readonly description: string,
    readonly createdAt: Date,
  ) {}
}
