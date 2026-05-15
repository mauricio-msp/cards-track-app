import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetPublicMemberPurchasesUseCase } from '@/modules/members/application/use-cases/get-public-member-purchases/get-public-member-purchases.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type { MemberPeriodQuery } from '@/modules/members/http/dto/members.dto'

export class GetPublicMemberPurchasesController {
  constructor(private readonly useCase: GetPublicMemberPurchasesUseCase) {}

  async handle(
    memberId: string,
    query: MemberPeriodQuery,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const cardsWithPurchases = await this.useCase.execute(memberId, query.month, query.year)
      return reply.send({ cardsWithPurchases })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar despesas do membro' })
    }
  }
}
