import { db } from '@/db'
import { InstallmentsRepository } from '@/modules/installments/installments.repository'
import { installmentsRoutes } from '@/modules/installments/installments.routes'
import { PayInstallmentController } from '@/modules/installments/use-cases/pay-installment/pay-installment.controller'
import { PayInstallmentUseCase } from '@/modules/installments/use-cases/pay-installment/pay-installment.use-case'
import { UnpayInstallmentController } from '@/modules/installments/use-cases/unpay-installment/unpay-installment.controller'
import { UnpayInstallmentUseCase } from '@/modules/installments/use-cases/unpay-installment/unpay-installment.use-case'

const repository = new InstallmentsRepository(db)

const controllers = {
  payInstallment: new PayInstallmentController(new PayInstallmentUseCase(repository)),
  unpayInstallment: new UnpayInstallmentController(new UnpayInstallmentUseCase(repository)),
}

export const installmentsModule = installmentsRoutes(controllers)
