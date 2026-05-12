import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetMemberPurchasesUseCase } from '@/modules/members/application/use-cases/get-member-purchases/get-member-purchases.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type { MemberPeriodQuery } from '@/modules/members/http/dto/members.dto'

export class GetMemberPurchasesController {
  constructor(private readonly useCase: GetMemberPurchasesUseCase) {}

  async handle(memberId: string, userId: string, query: MemberPeriodQuery, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const cardsWithPurchases = await this.useCase.execute(memberId, userId, query.month, query.year)
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
