export class DebtEntity {
  constructor(
    readonly id: string,
    readonly groupId: string,
    readonly cardId: string,
    readonly memberId: string,
    readonly installmentsCount: number,
    readonly installmentsAmount: number,
    readonly anticipatedAt: Date | null,
  ) {}

  isAnticipated(): boolean {
    return this.anticipatedAt !== null
  }

  isShared(count: number): boolean {
    return count > 1
  }
}
