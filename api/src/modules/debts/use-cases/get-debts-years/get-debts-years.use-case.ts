import type { IDebtsRepository } from '@/modules/debts/debts.repository.interface'

export class GetDebtsYearsUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(userId: string): Promise<number[]> {
    const years = await this.repo.getDebtsYears(userId)
    return years.length === 0 ? [new Date().getFullYear()] : years
  }
}
