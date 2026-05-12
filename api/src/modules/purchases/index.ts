import { db } from '@/db'
import { AnticipatePurchaseUseCase } from '@/modules/purchases/application/use-cases/anticipate-purchase/anticipate-purchase.use-case'
import { CreatePurchaseUseCase } from '@/modules/purchases/application/use-cases/create-purchase/create-purchase.use-case'
import { DeletePurchaseMemberUseCase } from '@/modules/purchases/application/use-cases/delete-purchase-member/delete-purchase-member.use-case'
import { DeletePurchaseUseCase } from '@/modules/purchases/application/use-cases/delete-purchase/delete-purchase.use-case'
import { GetMonthHighestAmountUseCase } from '@/modules/purchases/application/use-cases/get-month-highest-amount/get-month-highest-amount.use-case'
import { GetMonthLowestAmountUseCase } from '@/modules/purchases/application/use-cases/get-month-lowest-amount/get-month-lowest-amount.use-case'
import { GetMonthTotalAmountUseCase } from '@/modules/purchases/application/use-cases/get-month-total-amount/get-month-total-amount.use-case'
import { GetPurchasesTrendUseCase } from '@/modules/purchases/application/use-cases/get-purchases-trend/get-purchases-trend.use-case'
import { GetPurchasesYearsUseCase } from '@/modules/purchases/application/use-cases/get-purchases-years/get-purchases-years.use-case'
import { GetTotalAmountUseCase } from '@/modules/purchases/application/use-cases/get-total-amount/get-total-amount.use-case'
import { AnticipatePurchaseController } from '@/modules/purchases/http/controllers/anticipate-purchase.controller'
import { CreatePurchaseController } from '@/modules/purchases/http/controllers/create-purchase.controller'
import { DeletePurchaseController } from '@/modules/purchases/http/controllers/delete-purchase.controller'
import { DeletePurchaseMemberController } from '@/modules/purchases/http/controllers/delete-purchase-member.controller'
import { GetMonthHighestAmountController } from '@/modules/purchases/http/controllers/get-month-highest-amount.controller'
import { GetMonthLowestAmountController } from '@/modules/purchases/http/controllers/get-month-lowest-amount.controller'
import { GetMonthTotalAmountController } from '@/modules/purchases/http/controllers/get-month-total-amount.controller'
import { GetPurchasesTrendController } from '@/modules/purchases/http/controllers/get-purchases-trend.controller'
import { GetPurchasesYearsController } from '@/modules/purchases/http/controllers/get-purchases-years.controller'
import { GetTotalAmountController } from '@/modules/purchases/http/controllers/get-total-amount.controller'
import { purchasesRoutes } from '@/modules/purchases/http/routes'
import { PurchasesRepository } from '@/modules/purchases/infra/purchases.repository'

const repository = new PurchasesRepository(db)

const controllers = {
  createPurchase: new CreatePurchaseController(new CreatePurchaseUseCase(repository)),
  deletePurchase: new DeletePurchaseController(new DeletePurchaseUseCase(repository)),
  deletePurchaseMember: new DeletePurchaseMemberController(new DeletePurchaseMemberUseCase(repository)),
  anticipatePurchase: new AnticipatePurchaseController(new AnticipatePurchaseUseCase(repository)),
  getPurchasesTrend: new GetPurchasesTrendController(new GetPurchasesTrendUseCase(repository)),
  getPurchasesYears: new GetPurchasesYearsController(new GetPurchasesYearsUseCase(repository)),
  getMonthHighestAmount: new GetMonthHighestAmountController(new GetMonthHighestAmountUseCase(repository)),
  getMonthLowestAmount: new GetMonthLowestAmountController(new GetMonthLowestAmountUseCase(repository)),
  getMonthTotalAmount: new GetMonthTotalAmountController(new GetMonthTotalAmountUseCase(repository)),
  getTotalAmount: new GetTotalAmountController(new GetTotalAmountUseCase(repository)),
}

export const purchasesModule = purchasesRoutes(controllers)
