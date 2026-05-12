import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreatePurchaseUseCase } from '@/modules/purchases/application/use-cases/create-purchase/create-purchase.use-case'
import type { CreatePurchaseInput } from '@/modules/purchases/http/dto/purchases.dto'

export class CreatePurchaseController {
  constructor(private readonly useCase: CreatePurchaseUseCase) {}

  async handle(request: FastifyRequest<{ Body: CreatePurchaseInput }>, reply: FastifyReply) {
    try {
      const result = await this.useCase.execute(request.user.id, request.body)
      return reply.status(201).send({ purchase: result, message: 'Compra registrada com sucesso!' })
    } catch (err) {
      request.log.error(err)
      return reply.status(400).send({ message: err instanceof Error ? err.message : 'Erro ao registrar compra' })
    }
  }
}
