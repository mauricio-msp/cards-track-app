import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { GetInvoicePaymentSummaryUseCase } from '@/modules/cards/application/use-cases/get-invoice-payment-summary/get-invoice-payment-summary.use-case'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { CardPeriodQuery } from '@/modules/cards/http/dto/cards.dto'

export class GetInvoicePaymentSummaryController {
  constructor(private readonly useCase: GetInvoicePaymentSummaryUseCase) {}

  async handle(
    cardId: string,
    userId: string,
    query: CardPeriodQuery,
    reply: FastifyReply,
    log: FastifyBaseLogger,
  ) {
    try {
      const result = await this.useCase.execute(cardId, userId, query.month, query.year)
      return reply.send(result)
    } catch (err) {
      if (err instanceof CardNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      log.error(err)
      return reply
        .status(500)
        .send({ message: 'Falha ao buscar resumo de adiantamentos/pagamentos da fatura' })
    }
  }
}
