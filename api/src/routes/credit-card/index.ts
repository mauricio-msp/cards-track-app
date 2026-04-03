import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createCard } from '@/routes/credit-card/create-card'
import { getCard } from '@/routes/credit-card/get-card'
import { getCardDebts } from '@/routes/credit-card/get-card-debts'
import { getCards } from '@/routes/credit-card/get-cards'
import { getMonthTotalAmountCard } from '@/routes/credit-card/get-month-total-amount-card'
import { getTotalAmountUsedCard } from '@/routes/credit-card/get-total-amount-used-card'

export const cardRoutes: FastifyPluginAsyncZod = async app => {
  app.register(createCard)
  app.register(getCard)
  app.register(getCards)
  app.register(getCardDebts)
  app.register(getTotalAmountUsedCard)
  app.register(getMonthTotalAmountCard)
}
