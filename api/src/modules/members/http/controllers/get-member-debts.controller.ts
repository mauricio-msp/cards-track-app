import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMemberDebtsUseCase } from '@/modules/members/application/use-cases/get-member-debts/get-member-debts.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'

export class GetMemberDebtsController {
  constructor(private readonly useCase: GetMemberDebtsUseCase) {}

  async handle(
    request: FastifyRequest<{
      Params: { memberId: string }
      Querystring: { month?: number; year?: number }
    }>,
    reply: FastifyReply,
  ) {
    try {
      const cardsWithDebts = await this.useCase.execute(
        request.params.memberId,
        request.user.id,
        request.query.month,
        request.query.year,
      )
      return reply.send({ cardsWithDebts })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar despesas do membro' })
    }
  }
}
