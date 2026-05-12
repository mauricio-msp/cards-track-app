export class PurchaseMemberEntity {
  constructor(
    readonly id: string,
    readonly purchaseId: string,
    readonly cardId: string,
    readonly memberId: string,
    readonly installmentsCount: number,
    readonly installmentAmount: number,
    readonly anticipatedAt: Date | null,
  ) {}

  isAnticipated(): boolean {
    return this.anticipatedAt !== null
  }

  isShared(memberCount: number): boolean {
    return memberCount > 1
  }
}
