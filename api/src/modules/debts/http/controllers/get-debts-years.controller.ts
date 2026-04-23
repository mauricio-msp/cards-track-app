import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetDebtsYearsUseCase } from '@/modules/debts/application/use-cases/get-debts-years/get-debts-years.use-case'

export class GetDebtsYearsController {
  constructor(private readonly useCase: GetDebtsYearsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const years = await this.useCase.execute(request.user.id)
      return reply.status(200).send({ years })
    } catch (err) {
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao obter anos de despesas' })
    }
  }
}
