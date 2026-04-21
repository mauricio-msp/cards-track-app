import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import type { PayInstallmentController } from '@/modules/installments/use-cases/pay-installment/pay-installment.controller'
import type { UnpayInstallmentController } from '@/modules/installments/use-cases/unpay-installment/unpay-installment.controller'

type Controllers = {
  payInstallment: PayInstallmentController
  unpayInstallment: UnpayInstallmentController
}

export const installmentsRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.patch(
      '/api/installments/:installmentId/pay',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Marcar parcela como paga',
          description:
            'Atualiza o "paidAt" de uma parcela específica. Idempotente — se já estiver paga, atualiza o timestamp silenciosamente.',
          tags: ['Installments'],
          params: z.object({ installmentId: z.string() }),
          response: {
            200: z.object({ installmentId: z.string(), paidAt: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.payInstallment.handle(req, reply),
    )

    app.patch(
      '/api/installments/:installmentId/unpay',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Desfazer pagamento de parcela',
          description: 'Limpa o paidAt de uma parcela, revertendo para pendente.',
          tags: ['Installments'],
          params: z.object({ installmentId: z.string() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.unpayInstallment.handle(req, reply),
    )
  }
