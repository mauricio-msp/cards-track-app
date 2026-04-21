import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetSubscriptionsUseCase } from './get-subscriptions.use-case'

export class GetSubscriptionsController {
  constructor(private readonly useCase: GetSubscriptionsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const rows = await this.useCase.execute(request.user.id)
    return reply.status(200).send({
      subscriptions: rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })),
    })
  }
}
