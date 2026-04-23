export class SubscriptionEntity {
  constructor(
    readonly id: string,
    readonly memberId: string,
    readonly debtId: string,
    readonly active: boolean,
  ) {}

  isActive(): boolean {
    return this.active
  }
}
