import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import type { AnticipatePurchaseController } from '@/modules/purchases/http/controllers/anticipate-purchase.controller'
import type { CreatePurchaseController } from '@/modules/purchases/http/controllers/create-purchase.controller'
import type { DeletePurchaseController } from '@/modules/purchases/http/controllers/delete-purchase.controller'
import type { DeletePurchaseMemberController } from '@/modules/purchases/http/controllers/delete-purchase-member.controller'
import {
  anticipatePurchaseDto,
  createPurchaseDto,
  purchaseCreateResultSchema,
} from '@/modules/purchases/http/dto/purchases.dto'

type Controllers = {
  createPurchase: CreatePurchaseController
  deletePurchase: DeletePurchaseController
  deletePurchaseMember: DeletePurchaseMemberController
  anticipatePurchase: AnticipatePurchaseController
}

const pmIdParam = z.object({ pmId: z.string().uuid() })

export const purchasesRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.post(
      '/api/purchases',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Registrar nova compra com parcelas por membro',
          tags: ['Purchases'],
          body: createPurchaseDto,
          response: {
            201: z.object({ purchase: purchaseCreateResultSchema, message: z.string() }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.createPurchase.handle(req.body, req.user.id, reply, req.log),
    )

    app.delete(
      '/api/purchases/:pmId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir compra inteira (todos os membros)',
          tags: ['Purchases'],
          params: pmIdParam,
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.deletePurchase.handle(req.params.pmId, req.user.id, reply, req.log),
    )

    app.delete(
      '/api/purchases/:pmId/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Remover membro específico de uma compra compartilhada',
          tags: ['Purchases'],
          params: z.object({ pmId: z.string().uuid(), memberId: z.string().uuid() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.deletePurchaseMember.handle(
          req.params.pmId,
          req.params.memberId,
          req.user.id,
          reply,
          req.log,
        ),
    )

    app.patch(
      '/api/purchases/:pmId/anticipate',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Antecipar parcelas futuras para a fatura atual',
          tags: ['Purchases'],
          params: pmIdParam,
          body: anticipatePurchaseDto,
          response: {
            200: z.object({
              message: z.string(),
              anticipatedAmount: z.number(),
              installmentsAnticipated: z.number(),
            }),
            400: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.anticipatePurchase.handle(req.params.pmId, req.body, req.user.id, reply, req.log),
    )
  }
