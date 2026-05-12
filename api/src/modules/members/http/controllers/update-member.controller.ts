import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { UpdateMemberUseCase } from '@/modules/members/application/use-cases/update-member/update-member.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type { UpdateMemberInput } from '@/modules/members/http/dto/members.dto'

export class UpdateMemberController {
  constructor(private readonly useCase: UpdateMemberUseCase) {}

  async handle(memberId: string, body: UpdateMemberInput, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const member = await this.useCase.execute(memberId, userId, body)
      return reply.send({ member, message: 'Membro atualizado com sucesso' })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao atualizar o membro' })
    }
  }
}
