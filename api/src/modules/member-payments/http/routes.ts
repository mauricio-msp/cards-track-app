import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import type { CreateMemberPaymentController } from '@/modules/member-payments/http/controllers/create-member-payment.controller'
import type { DeleteMemberPaymentController } from '@/modules/member-payments/http/controllers/delete-member-payment.controller'
import type { GetMemberPaymentsController } from '@/modules/member-payments/http/controllers/get-member-payments.controller'
import type { UpdateMemberPaymentController } from '@/modules/member-payments/http/controllers/update-member-payment.controller'
import {
  createMemberPaymentDto,
  memberPaymentPeriodQueryDto,
  memberPaymentResponseSchema,
  updateMemberPaymentDto,
} from '@/modules/member-payments/http/dto/member-payments.dto'

type Controllers = {
  getMemberPayments: GetMemberPaymentsController
  createMemberPayment: CreateMemberPaymentController
  updateMemberPayment: UpdateMemberPaymentController
  deleteMemberPayment: DeleteMemberPaymentController
}

const paramsSchema = z.object({
  memberId: z.string(),
  cardId: z.string(),
})

const paymentParamsSchema = z.object({
  memberId: z.string(),
  cardId: z.string(),
  paymentId: z.string(),
})

export const memberPaymentsRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.get(
      '/api/members/:memberId/cards/:cardId/payments',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Lista pagamentos de um membro em um cartão por período',
          tags: ['MemberPayments'],
          params: paramsSchema,
          querystring: memberPaymentPeriodQueryDto,
          response: {
            200: z.object({
              payments: z.array(memberPaymentResponseSchema),
              totalPaid: z.number(),
              remaining: z.number(),
            }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.getMemberPayments.handle(
          req.params.memberId,
          req.params.cardId,
          req.query,
          reply,
          req.log,
        ),
    )

    app.post(
      '/api/members/:memberId/cards/:cardId/payments',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Registra um pagamento/adiantamento de membro',
          tags: ['MemberPayments'],
          params: paramsSchema,
          body: createMemberPaymentDto,
          response: {
            201: z.object({ payment: memberPaymentResponseSchema, message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.createMemberPayment.handle(
          req.params.memberId,
          req.params.cardId,
          req.body,
          reply,
          req.log,
        ),
    )

    app.patch(
      '/api/members/:memberId/cards/:cardId/payments/:paymentId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Atualiza um pagamento de membro',
          tags: ['MemberPayments'],
          params: paymentParamsSchema,
          body: updateMemberPaymentDto,
          response: {
            200: z.object({ payment: memberPaymentResponseSchema, message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.updateMemberPayment.handle(req.params.paymentId, req.body, reply, req.log),
    )

    app.delete(
      '/api/members/:memberId/cards/:cardId/payments/:paymentId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Remove um pagamento de membro',
          tags: ['MemberPayments'],
          params: paymentParamsSchema,
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.deleteMemberPayment.handle(req.params.paymentId, reply, req.log),
    )
  }
