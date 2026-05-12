import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetMembersUseCase } from '@/modules/members/application/use-cases/get-members/get-members.use-case'

export class GetMembersController {
  constructor(private readonly useCase: GetMembersUseCase) {}

  async handle(userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const rows = await this.useCase.execute(userId)
      return reply.status(200).send({ members: rows })
    } catch (err) {
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar membros' })
    }
  }
}
