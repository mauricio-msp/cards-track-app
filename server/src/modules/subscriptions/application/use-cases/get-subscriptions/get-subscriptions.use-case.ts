import type {
  ISubscriptionsRepository,
  SubscriptionRow,
} from '@/modules/subscriptions/domain/repositories/subscriptions.repository.interface'

export class GetSubscriptionsUseCase {
  constructor(private readonly repo: ISubscriptionsRepository) {}

  async execute(userId: string): Promise<SubscriptionRow[]> {
    return this.repo.findAll(userId)
  }
}
