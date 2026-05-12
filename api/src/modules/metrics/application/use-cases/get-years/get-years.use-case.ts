import type { IMetricsRepository } from '@/modules/metrics/domain/repositories/metrics.repository.interface'

export class GetYearsUseCase {
  constructor(private readonly repo: IMetricsRepository) {}

  async execute(userId: string): Promise<number[]> {
    return this.repo.getYears(userId)
  }
}
