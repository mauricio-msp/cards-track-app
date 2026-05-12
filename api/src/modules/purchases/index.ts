import { db } from '@/db'
import { AnticipatePurchaseUseCase } from '@/modules/purchases/application/use-cases/anticipate-purchase/anticipate-purchase.use-case'
import { CreatePurchaseUseCase } from '@/modules/purchases/application/use-cases/create-purchase/create-purchase.use-case'
import { DeletePurchaseMemberUseCase } from '@/modules/purchases/application/use-cases/delete-purchase-member/delete-purchase-member.use-case'
import { DeletePurchaseUseCase } from '@/modules/purchases/application/use-cases/delete-purchase/delete-purchase.use-case'
import { AnticipatePurchaseController } from '@/modules/purchases/http/controllers/anticipate-purchase.controller'
import { CreatePurchaseController } from '@/modules/purchases/http/controllers/create-purchase.controller'
import { DeletePurchaseMemberController } from '@/modules/purchases/http/controllers/delete-purchase-member.controller'
import { DeletePurchaseController } from '@/modules/purchases/http/controllers/delete-purchase.controller'
import { purchasesRoutes } from '@/modules/purchases/http/routes'
import { PurchasesRepository } from '@/modules/purchases/infra/purchases.repository'

const repository = new PurchasesRepository(db)

const controllers = {
  createPurchase: new CreatePurchaseController(new CreatePurchaseUseCase(repository)),
  deletePurchase: new DeletePurchaseController(new DeletePurchaseUseCase(repository)),
  deletePurchaseMember: new DeletePurchaseMemberController(new DeletePurchaseMemberUseCase(repository)),
  anticipatePurchase: new AnticipatePurchaseController(new AnticipatePurchaseUseCase(repository)),
}

export const purchasesModule = purchasesRoutes(controllers)
