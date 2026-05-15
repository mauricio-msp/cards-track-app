import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetPublicMemberUseCase } from '@/modules/members/application/use-cases/get-public-member/get-public-member.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'

export class GetPublicMemberController {
  constructor(private readonly useCase: GetPublicMemberUseCase) {}

  async handle(memberId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const member = await this.useCase.execute(memberId)
      return reply.send({ member })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar membro' })
    }
  }
}
