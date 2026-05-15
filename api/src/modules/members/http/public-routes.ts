import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { GetPublicMemberController } from '@/modules/members/http/controllers/get-public-member.controller'
import type { GetPublicMemberPurchasesController } from '@/modules/members/http/controllers/get-public-member-purchases.controller'
import { memberPeriodQueryDto } from '@/modules/members/http/dto/members.dto'

type PublicControllers = {
  getPublicMember: GetPublicMemberController
  getPublicMemberPurchases: GetPublicMemberPurchasesController
}

export const membersPublicRoutes =
  (controllers: PublicControllers): FastifyPluginAsyncZod =>
  async app => {
    app.get(
      '/api/public/members/:memberId',
      {
        schema: {
          summary: 'Obter dados públicos do membro',
          tags: ['Public'],
          params: z.object({ memberId: z.string().uuid() }),
          response: {
            200: z.object({
              member: z.object({
                id: z.string(),
                name: z.string(),
                relationship: z.string(),
                phone: z.string().nullable(),
              }),
            }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.getPublicMember.handle(req.params.memberId, reply, req.log),
    )

    app.get(
      '/api/public/members/:memberId/purchases-by-card',
      {
        schema: {
          summary: 'Obter despesas públicas do membro por cartão',
          tags: ['Public'],
          params: z.object({ memberId: z.string().uuid() }),
          querystring: memberPeriodQueryDto,
          response: {
            200: z.object({
              cardsWithPurchases: z.array(
                z.object({
                  card: z.object({
                    id: z.string(),
                    name: z.string(),
                    dueDay: z.number(),
                    targetYear: z.number(),
                    targetMonth: z.number(),
                  }),
                  purchases: z.array(
                    z.object({
                      id: z.string(),
                      description: z.string(),
                      purchaseDate: z.string(),
                      amount: z.number(),
                      installmentsCount: z.number(),
                      installmentsAmount: z.number(),
                      elapsedInstallments: z.number(),
                      remainingInstallments: z.number(),
                      anticipatedAt: z.string().nullable(),
                      anticipatedInstallmentsCount: z.number().nullish(),
                      anticipateFromInstallment: z.number().nullish(),
                    }),
                  ),
                }),
              ),
            }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.getPublicMemberPurchases.handle(
          req.params.memberId,
          req.query,
          reply,
          req.log,
        ),
    )
  }
