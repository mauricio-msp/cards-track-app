import { db } from '@/db'
import { SubscriptionsRepository } from '@/modules/subscriptions/subscriptions.repository'
import { subscriptionsRoutes } from '@/modules/subscriptions/subscriptions.routes'
import { CreateSubscriptionController } from './use-cases/create-subscription/create-subscription.controller'
import { CreateSubscriptionUseCase } from './use-cases/create-subscription/create-subscription.use-case'
import { DeactivateSubscriptionController } from './use-cases/deactivate-subscription/deactivate-subscription.controller'
import { DeactivateSubscriptionUseCase } from './use-cases/deactivate-subscription/deactivate-subscription.use-case'
import { GetSubscriptionsController } from './use-cases/get-subscriptions/get-subscriptions.controller'
import { GetSubscriptionsUseCase } from './use-cases/get-subscriptions/get-subscriptions.use-case'
import { UpdateSubscriptionController } from './use-cases/update-subscription/update-subscription.controller'
import { UpdateSubscriptionUseCase } from './use-cases/update-subscription/update-subscription.use-case'

const repository = new SubscriptionsRepository(db)

const controllers = {
  createSubscription: new CreateSubscriptionController(new CreateSubscriptionUseCase(repository)),
  getSubscriptions: new GetSubscriptionsController(new GetSubscriptionsUseCase(repository)),
  updateSubscription: new UpdateSubscriptionController(new UpdateSubscriptionUseCase(repository)),
  deactivateSubscription: new DeactivateSubscriptionController(
    new DeactivateSubscriptionUseCase(repository),
  ),
}

export const subscriptionsModule = subscriptionsRoutes(controllers)
