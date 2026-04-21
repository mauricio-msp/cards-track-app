import type { FastifyReply, FastifyRequest } from 'fastify'
import { InstallmentNotFoundError } from '@/modules/installments/installments.errors'
import type { PayInstallmentUseCase } from '@/modules/installments/use-cases/pay-installment/pay-installment.use-case'

export class PayInstallmentController {
  constructor(private readonly useCase: PayInstallmentUseCase) {}

  async handle(
    request: FastifyRequest<{ Params: { installmentId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await this.useCase.execute(request.params.installmentId, request.user.id)
      return reply.status(200).send(result)
    } catch (err) {
      if (err instanceof InstallmentNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }

      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao pagar parcela' })
    }
  }
}
