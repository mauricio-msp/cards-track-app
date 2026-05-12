import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetSubscriptionsUseCase } from '@/modules/subscriptions/application/use-cases/get-subscriptions/get-subscriptions.use-case'

export class GetSubscriptionsController {
  constructor(private readonly useCase: GetSubscriptionsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const rows = await this.useCase.execute(request.user.id)
      return reply.status(200).send({
        subscriptions: rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
      })
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao listar assinaturas' })
    }
  }
}
