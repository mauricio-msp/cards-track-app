import { db } from '@/db'
import { PayInstallmentUseCase } from '@/modules/installments/application/use-cases/pay-installment/pay-installment.use-case'
import { UnpayInstallmentUseCase } from '@/modules/installments/application/use-cases/unpay-installment/unpay-installment.use-case'
import { PayInstallmentController } from '@/modules/installments/http/controllers/pay-installment.controller'
import { UnpayInstallmentController } from '@/modules/installments/http/controllers/unpay-installment.controller'
import { installmentsRoutes } from '@/modules/installments/http/routes'
import { InstallmentsRepository } from '@/modules/installments/infra/installments.repository'

const repository = new InstallmentsRepository(db)

const controllers = {
  payInstallment: new PayInstallmentController(new PayInstallmentUseCase(repository)),
  unpayInstallment: new UnpayInstallmentController(new UnpayInstallmentUseCase(repository)),
}

export const installmentsModule = installmentsRoutes(controllers)
