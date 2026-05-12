import type { IMetricsRepository } from '@/modules/metrics/domain/repositories/metrics.repository.interface'

export class GetMonthTotalAmountUseCase {
  constructor(private readonly repo: IMetricsRepository) {}

  async execute(userId: string): Promise<number> {
    const now = new Date()
    return this.repo.getMonthTotalAmount(userId, now.getMonth(), now.getFullYear(), now.getDate())
  }
}
