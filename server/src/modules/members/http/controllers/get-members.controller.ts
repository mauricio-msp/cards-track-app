import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMembersUseCase } from '@/modules/members/application/use-cases/get-members/get-members.use-case'

export class GetMembersController {
  constructor(private readonly useCase: GetMembersUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const rows = await this.useCase.execute(request.user.id)
    return reply.status(200).send({ members: rows })
  }
}
