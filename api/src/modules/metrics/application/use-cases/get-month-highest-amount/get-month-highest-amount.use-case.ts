import type {
  CardAmountRow,
  IMetricsRepository,
} from '@/modules/metrics/domain/repositories/metrics.repository.interface'

export class GetMonthHighestAmountUseCase {
  constructor(private readonly repo: IMetricsRepository) {}

  async execute(userId: string): Promise<{ amount: number; cards: CardAmountRow[] }> {
    const now = new Date()
    const rows = await this.repo.getMonthCardAmounts(userId, now.getMonth(), now.getFullYear())

    if (rows.length === 0) return { amount: 0, cards: [] }

    const max = Math.max(...rows.map(r => r.total))

    return { amount: max, cards: rows.filter(r => r.total === max) }
  }
}
