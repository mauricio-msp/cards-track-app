import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { CreatePurchaseUseCase } from '@/modules/purchases/application/use-cases/create-purchase/create-purchase.use-case'
import type { CreatePurchaseInput } from '@/modules/purchases/http/dto/purchases.dto'

export class CreatePurchaseController {
  constructor(private readonly useCase: CreatePurchaseUseCase) {}

  async handle(body: CreatePurchaseInput, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const result = await this.useCase.execute(userId, body)
      return reply.status(201).send({ purchase: result, message: 'Compra registrada com sucesso!' })
    } catch (err) {
      log.error(err)
      return reply.status(400).send({ message: err instanceof Error ? err.message : 'Erro ao registrar compra' })
    }
  }
}
