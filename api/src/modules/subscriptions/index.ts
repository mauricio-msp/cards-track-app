import { db } from '@/db'
import { subscriptionsController } from '@/modules/subscriptions/subscriptions.controller'
import { SubscriptionsRepository } from '@/modules/subscriptions/subscriptions.repository'
import { SubscriptionsService } from '@/modules/subscriptions/subscriptions.service'

const repository = new SubscriptionsRepository(db)
const service = new SubscriptionsService(repository)

export const subscriptionsModule = subscriptionsController(service)
