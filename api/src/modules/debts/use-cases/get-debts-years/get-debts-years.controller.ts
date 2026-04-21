import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetDebtsYearsUseCase } from './get-debts-years.use-case'

export class GetDebtsYearsController {
  constructor(private readonly useCase: GetDebtsYearsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const years = await this.useCase.execute(request.user.id)
    return reply.status(200).send({ years })
  }
}
