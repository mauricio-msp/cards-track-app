import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import { InstallmentNotFoundError } from '@/modules/installments/installments.errors'
import type { InstallmentsService } from '@/modules/installments/installments.service'

export const installmentsController =
  (service: InstallmentsService): FastifyPluginAsyncZod =>
  async app => {
    // PATCH /api/installments/:installmentId/pay
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
      async (request, reply) => {
        try {
          const result = await service.pay(request.params.installmentId, request.user.id)
          return reply.status(200).send(result)
        } catch (err) {
          if (err instanceof InstallmentNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao pagar parcela' })
        }
      },
    )

    // PATCH /api/installments/:installmentId/unpay
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
            400: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          await service.unpay(request.params.installmentId, request.user.id)
          return reply.status(200).send({ message: 'Pagamento da parcela desfeito com sucesso!' })
        } catch (err) {
          if (err instanceof InstallmentNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao desfazer pagamento' })
        }
      },
    )
  }
