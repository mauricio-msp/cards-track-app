import type { FastifyReply, FastifyRequest } from 'fastify'
import { InstallmentNotFoundError } from '@/modules/installments/domain/errors/installments.errors'
import type { UnpayInstallmentUseCase } from '@/modules/installments/application/use-cases/unpay-installment/unpay-installment.use-case'

export class UnpayInstallmentController {
  constructor(private readonly useCase: UnpayInstallmentUseCase) {}

  async handle(
    request: FastifyRequest<{ Params: { installmentId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      await this.useCase.execute(request.params.installmentId, request.user.id)
      return reply.status(200).send({ message: 'Pagamento da parcela desfeito com sucesso!' })
    } catch (err) {
      if (err instanceof InstallmentNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao desfazer pagamento' })
    }
  }
}
