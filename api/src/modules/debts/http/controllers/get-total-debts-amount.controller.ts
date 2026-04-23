import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetTotalDebtsAmountUseCase } from '@/modules/debts/application/use-cases/get-total-debts-amount/get-total-debts-amount.use-case'

export class GetTotalDebtsAmountController {
  constructor(private readonly useCase: GetTotalDebtsAmountUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const totalAmount = await this.useCase.execute(request.user.id)
      return reply.status(200).send({ totalAmount })
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao obter saldo devedor total' })
    }
  }
}
