import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { createMemberDto, getMemberDebtsQueryDto, memberSchema, updateMemberDto } from '@/modules/members/members.dto'
import type { CreateMemberController } from './use-cases/create-member/create-member.controller'
import type { DeleteMemberController } from './use-cases/delete-member/delete-member.controller'
import type { GetMemberDebtsController } from './use-cases/get-member-debts/get-member-debts.controller'
import type { GetMemberController } from './use-cases/get-member/get-member.controller'
import type { GetMembersController } from './use-cases/get-members/get-members.controller'
import type { UpdateMemberController } from './use-cases/update-member/update-member.controller'

type Controllers = {
  createMember: CreateMemberController
  getMembers: GetMembersController
  getMember: GetMemberController
  updateMember: UpdateMemberController
  deleteMember: DeleteMemberController
  getMemberDebts: GetMemberDebtsController
}

export const membersRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.post(
      '/api/members',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Cria um novo membro',
          tags: ['Members'],
          body: createMemberDto,
          response: {
            201: z.object({ member: memberSchema.nullable(), message: z.string() }),
            409: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.createMember.handle(req, reply),
    )

    app.get(
      '/api/members',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Lista todos os membros',
          description: 'Retorna a lista completa de membros cadastrados pelo usuário autenticado para divisão de despesas.',
          tags: ['Members'],
          response: {
            200: z.object({
              members: z.array(
                createSelectSchema(members).pick({ id: true, name: true, relationship: true, createdAt: true }),
              ),
            }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.getMembers.handle(req, reply),
    )

    app.get(
      '/api/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter detalhes do membro pelo ID',
          tags: ['Members'],
          params: z.object({ memberId: z.string() }),
          response: {
            200: z.object({
              member: createSelectSchema(members).pick({ name: true, relationship: true }),
            }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.getMember.handle(req, reply),
    )

    app.patch(
      '/api/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Atualizar dados do membro',
          description: 'Permite atualizar telefone e parentesco. O nome é imutável para preservar o histórico de despesas.',
          tags: ['Members'],
          params: z.object({ memberId: z.string() }),
          body: updateMemberDto,
          response: {
            200: z.object({ member: memberSchema, message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.updateMember.handle(req, reply),
    )

    app.delete(
      '/api/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir um membro',
          description: 'Faz exclusão lógica do membro. Suas despesas permanecem ativas e associadas ao histórico.',
          tags: ['Members'],
          params: z.object({ memberId: z.string() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) => controllers.deleteMember.handle(req, reply),
    )

    app.get(
      '/api/members/:memberId/debts-by-card',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter despesas de um membro agrupadas por cartão',
          tags: ['Members'],
          params: z.object({ memberId: z.string() }),
          querystring: getMemberDebtsQueryDto,
          response: {
            200: z.object({
              cardsWithDebts: z.array(
                z.object({
                  card: z.object({
                    id: z.string(),
                    name: z.string(),
                    dueDay: z.number(),
                    targetYear: z.number(),
                    targetMonth: z.number(),
                  }),
                  debts: z.array(
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
      (req, reply) => controllers.getMemberDebts.handle(req, reply),
    )
  }
