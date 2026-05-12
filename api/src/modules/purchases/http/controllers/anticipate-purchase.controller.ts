import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { AnticipatePurchaseUseCase } from '@/modules/purchases/application/use-cases/anticipate-purchase/anticipate-purchase.use-case'
import {
  InvalidAnticipateInstallmentError,
  NoUnpaidInstallmentsError,
  PurchaseAlreadyAnticipatedError,
  PurchaseNotFoundError,
  PurchaseSharedBetweenMembersError,
} from '@/modules/purchases/domain/errors/purchases.errors'
import type { AnticipatePurchaseInput } from '@/modules/purchases/http/dto/purchases.dto'

export class AnticipatePurchaseController {
  constructor(private readonly useCase: AnticipatePurchaseUseCase) {}

  async handle(pmId: string, body: AnticipatePurchaseInput, userId: string, reply: FastifyReply, log: FastifyBaseLogger) {
    try {
      const result = await this.useCase.execute(pmId, userId, body)
      return reply.send({ message: 'Parcelas antecipadas com sucesso', ...result })
    } catch (err) {
      if (
        err instanceof PurchaseNotFoundError ||
        err instanceof NoUnpaidInstallmentsError
      ) return reply.status(404).send({ message: err.message })
      if (
        err instanceof PurchaseAlreadyAnticipatedError ||
        err instanceof PurchaseSharedBetweenMembersError ||
        err instanceof InvalidAnticipateInstallmentError
      ) return reply.status(400).send({ message: err.message })
      log.error(err)
      return reply.status(500).send({ message: 'Erro ao antecipar parcelas' })
    }
  }
}
