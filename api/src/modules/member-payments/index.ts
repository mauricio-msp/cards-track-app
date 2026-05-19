import { db } from '@/db'
import { CreateMemberPaymentUseCase } from '@/modules/member-payments/application/use-cases/create-member-payment/create-member-payment.use-case'
import { DeleteMemberPaymentUseCase } from '@/modules/member-payments/application/use-cases/delete-member-payment/delete-member-payment.use-case'
import { GetMemberPaymentsUseCase } from '@/modules/member-payments/application/use-cases/get-member-payments/get-member-payments.use-case'
import { UpdateMemberPaymentUseCase } from '@/modules/member-payments/application/use-cases/update-member-payment/update-member-payment.use-case'
import { CreateMemberPaymentController } from '@/modules/member-payments/http/controllers/create-member-payment.controller'
import { DeleteMemberPaymentController } from '@/modules/member-payments/http/controllers/delete-member-payment.controller'
import { GetMemberPaymentsController } from '@/modules/member-payments/http/controllers/get-member-payments.controller'
import { UpdateMemberPaymentController } from '@/modules/member-payments/http/controllers/update-member-payment.controller'
import { memberPaymentsRoutes } from '@/modules/member-payments/http/routes'
import { MemberPaymentsRepository } from '@/modules/member-payments/infra/member-payments.repository'

const repository = new MemberPaymentsRepository(db)

const controllers = {
  getMemberPayments: new GetMemberPaymentsController(new GetMemberPaymentsUseCase(repository)),
  createMemberPayment: new CreateMemberPaymentController(new CreateMemberPaymentUseCase(repository)),
  updateMemberPayment: new UpdateMemberPaymentController(new UpdateMemberPaymentUseCase(repository)),
  deleteMemberPayment: new DeleteMemberPaymentController(new DeleteMemberPaymentUseCase(repository)),
}

export const memberPaymentsModule = memberPaymentsRoutes(controllers)
