import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateDebtUseCase } from '@/modules/debts/application/use-cases/create-debt/create-debt.use-case'
import type { CreateDebtInput } from '@/modules/debts/http/dto/debts.dto'

export class CreateDebtController {
  constructor(private readonly useCase: CreateDebtUseCase) {}

  async handle(request: FastifyRequest<{ Body: CreateDebtInput }>, reply: FastifyReply) {
    try {
      const createdDebts = await this.useCase.execute(request.user.id, request.body)
      return reply.status(201).send({
        debts: createdDebts,
        message: 'Despesas e parcelas registradas com sucesso!',
      })
    } catch (err) {
      request.log.error(err)
      return reply.status(400).send({
        message: err instanceof Error ? err.message : 'Erro ao registrar despesa(s)',
      })
    }
  }
}
