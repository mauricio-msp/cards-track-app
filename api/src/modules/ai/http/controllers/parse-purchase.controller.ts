import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { ParsePurchaseInput, ParsePurchaseUseCase } from '@/modules/ai/application/use-cases/parse-purchase/parse-purchase.use-case'

export class ParsePurchaseController {
  constructor(private readonly useCase: ParsePurchaseUseCase) {}

  async handle(body: ParsePurchaseInput, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const result = await this.useCase.execute(body)
      return reply.status(200).send(result)
    } catch (err) {
      log.error(err)
      const message = err instanceof Error ? err.message : ''
      if (message.includes('429') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('rate')) {
        return reply.status(429).send({ message: 'Limite de IA atingido, tente em instantes.' })
      }
      return reply.status(502).send({ message: 'Serviço de IA indisponível, tente novamente.' })
    }
  }
}
