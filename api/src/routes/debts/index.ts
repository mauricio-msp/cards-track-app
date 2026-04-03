import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { anticipateDebt } from '@/routes/debts/anticipate-debt'
import { createDebt } from '@/routes/debts/create-debt'
import { deleteDebt } from '@/routes/debts/delete-debt'
import { deleteDebtMember } from '@/routes/debts/delete-debt-member'
import { getDebtsTrend } from '@/routes/debts/get-debts-trend'
import { getDebtsYears } from '@/routes/debts/get-debts-years'
import { getMonthHighestDebtsAmount } from '@/routes/debts/get-month-highest-debts-amount'
import { getMonthLowestDebtsAmount } from '@/routes/debts/get-month-lowest-debts-amount'
import { getMonthTotalDebtsAmount } from '@/routes/debts/get-month-total-debts-amount'
import { getTotalDebtsAmount } from '@/routes/debts/get-total-debts-amount'

export const debtsRoutes: FastifyPluginAsyncZod = async app => {
  app.register(createDebt)
  app.register(deleteDebt)
  app.register(deleteDebtMember)
  app.register(anticipateDebt)
  app.register(getDebtsTrend)
  app.register(getDebtsYears)
  app.register(getMonthHighestDebtsAmount)
  app.register(getMonthLowestDebtsAmount)
  app.register(getMonthTotalDebtsAmount)
  app.register(getTotalDebtsAmount)
}
