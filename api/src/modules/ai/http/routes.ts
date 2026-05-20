import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import type { ParsePurchaseController } from '@/modules/ai/http/controllers/parse-purchase.controller'

type Controllers = {
  parsePurchase: ParsePurchaseController
}

export const aiRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.post(
      '/api/ai/parse-purchase',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Extrair campos de compra a partir de texto livre usando IA',
          tags: ['AI'],
          body: z.object({
            text: z.string().min(1, 'Texto é obrigatório'),
            members: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              }),
            ),
          }),
          response: {
            200: z.object({
              parsed: z.object({
                description: z.string().optional(),
                purchaseDate: z.string().optional(),
                category: z.string().optional(),
                installmentsCount: z.number().optional(),
                isRecurring: z.boolean().optional(),
                members: z
                  .array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      amount: z.string(),
                      startInstallment: z.number().nullable().optional(),
                      endInstallment: z.number().nullable().optional(),
                    }),
                  )
                  .optional(),
              }),
              missing: z.array(z.string()),
              unknownMemberNames: z.array(z.string()),
            }),
            429: z.object({ message: z.string() }),
            502: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.parsePurchase.handle(req.body, reply, req.log),
    )
  }
