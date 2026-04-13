import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { members } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import {
  createMemberDto,
  getMemberDebtsQueryDto,
  memberSchema,
  updateMemberDto,
} from '@/modules/members/members.dto'
import { MemberAlreadyExistsError, MemberNotFoundError } from '@/modules/members/members.errors'
import type { MembersService } from '@/modules/members/members.service'

export const membersController =
  (service: MembersService): FastifyPluginAsyncZod =>
  async app => {
    // POST /api/members
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
      async (request, reply) => {
        try {
          const member = await service.create(request.user.id, request.body)
          return reply.status(201).send({ member, message: 'Membro criado com sucesso!' })
        } catch (err) {
          if (err instanceof MemberAlreadyExistsError) {
            return reply.status(409).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao criar o membro' })
        }
      },
    )

    // GET /api/members
    app.get(
      '/api/members',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Lista todos os membros',
          description:
            'Retorna a lista completa de membros (familiares, amigos, etc.) cadastrados pelo usuário autenticado para divisão de despesas.',
          tags: ['Members'],
          response: {
            200: z.object({
              members: z.array(
                createSelectSchema(members).pick({
                  id: true,
                  name: true,
                  relationship: true,
                  createdAt: true,
                }),
              ),
            }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        const rows = await service.findAll(request.user.id)
        return reply.status(200).send({ members: rows })
      },
    )

    // GET /api/members/:memberId
    app.get(
      '/api/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter detalhes do membro pelo ID',
          description:
            'Retorna as informações completas de um membro específico (nome, parentesco/relacionamento) cadastrado pelo usuário.',
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
      async (request, reply) => {
        try {
          const member = await service.findById(request.params.memberId, request.user.id)
          return reply.send({ member: { name: member.name, relationship: member.relationship } })
        } catch (err) {
          if (err instanceof MemberNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar o membro' })
        }
      },
    )

    // PATCH /api/members/:memberId
    app.patch(
      '/api/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Atualizar dados do membro',
          description:
            'Permite atualizar telefone e parentesco. O nome é imutável para preservar o histórico de despesas.',
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
      async (request, reply) => {
        try {
          const member = await service.update(
            request.params.memberId,
            request.user.id,
            request.body,
          )

          return reply.send({ member, message: 'Membro atualizado com sucesso' })
        } catch (err) {
          if (err instanceof MemberNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao atualizar o membro' })
        }
      },
    )

    // DELETE /api/members/:memberId
    app.delete(
      '/api/members/:memberId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir um membro',
          description:
            'Faz exclusão lógica do membro. Suas despesas permanecem ativas e associadas ao histórico.',
          tags: ['Members'],
          params: z.object({ memberId: z.string() }),
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          await service.delete(request.params.memberId, request.user.id)
          return reply
            .status(200)
            .send({ message: 'Membro excluído com sucesso. Histórico de despesas preservado.' })
        } catch (err) {
          if (err instanceof MemberNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao excluir o membro' })
        }
      },
    )

    // GET /api/members/:memberId/debts-by-card
    app.get(
      '/api/members/:memberId/debts-by-card',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter despesas de um membro agrupadas por cartão',
          description:
            'Retorna as parcelas de um membro específico, calculando a fatura correta para cada cartão via CASE WHEN no banco — sem N+1 queries.',
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
      async (request, reply) => {
        try {
          const { memberId } = request.params
          const { month, year } = request.query

          const cardsWithDebts = await service.getMemberDebts(
            memberId,
            request.user.id,
            month,
            year,
          )

          return reply.send({ cardsWithDebts })
        } catch (err) {
          if (err instanceof MemberNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }

          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar despesas do membro' })
        }
      },
    )
  }
