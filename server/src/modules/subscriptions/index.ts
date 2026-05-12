import { db } from '@/db'
import { CreateSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/create-subscription/create-subscription.use-case'
import { DeactivateSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/deactivate-subscription/deactivate-subscription.use-case'
import { GetSubscriptionsUseCase } from '@/modules/subscriptions/application/use-cases/get-subscriptions/get-subscriptions.use-case'
import { UpdateSubscriptionUseCase } from '@/modules/subscriptions/application/use-cases/update-subscription/update-subscription.use-case'
import { CreateSubscriptionController } from '@/modules/subscriptions/http/controllers/create-subscription.controller'
import { DeactivateSubscriptionController } from '@/modules/subscriptions/http/controllers/deactivate-subscription.controller'
import { GetSubscriptionsController } from '@/modules/subscriptions/http/controllers/get-subscriptions.controller'
import { UpdateSubscriptionController } from '@/modules/subscriptions/http/controllers/update-subscription.controller'
import { subscriptionsRoutes } from '@/modules/subscriptions/http/routes'
import { SubscriptionsRepository } from '@/modules/subscriptions/infra/subscriptions.repository'

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
