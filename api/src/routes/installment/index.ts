import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import { payInstallment } from '@/routes/installment/pay-installment'
import { unpayInstallment } from '@/routes/installment/unpay-installment'

export const installmentRoutes: FastifyPluginAsyncZod = async app => {
  app.register(payInstallment)
  app.register(unpayInstallment)
}
