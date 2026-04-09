import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createSubscription } from '@/routes/subscriptions/create-subscription'
import { deleteSubscription } from '@/routes/subscriptions/delete-subscription'
import { getSubscriptions } from '@/routes/subscriptions/get-subscriptions'
import { updateSubscription } from '@/routes/subscriptions/update-subscription'

export const subscriptionRoutes: FastifyPluginAsyncZod = async app => {
  app.register(createSubscription)
  app.register(getSubscriptions)
  app.register(updateSubscription)
  app.register(deleteSubscription)
}
