export class CardEntity {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly limit: number,
    readonly dueDay: number,
    readonly closingOffsetDays: number,
  ) {}

  availableLimit(used: number): number {
    return this.limit - used
  }

  isOverLimit(used: number, newAmount: number): boolean {
    return used + newAmount > this.limit
  }
}
