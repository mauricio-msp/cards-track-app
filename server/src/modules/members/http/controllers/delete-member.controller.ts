import type { FastifyReply, FastifyRequest } from 'fastify'
import type { DeleteMemberUseCase } from '@/modules/members/application/use-cases/delete-member/delete-member.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'

export class DeleteMemberController {
  constructor(private readonly useCase: DeleteMemberUseCase) {}

  async handle(request: FastifyRequest<{ Params: { memberId: string } }>, reply: FastifyReply) {
    try {
      await this.useCase.execute(request.params.memberId, request.user.id)
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
  }
}
