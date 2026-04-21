import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateDebtInput } from '@/modules/debts/debts.dto'
import type { CreateDebtUseCase } from './create-debt.use-case'

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
