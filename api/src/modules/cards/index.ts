import { db } from '@/db'
import { CreateCardUseCase } from '@/modules/cards/application/use-cases/create-card/create-card.use-case'
import { DeleteCardUseCase } from '@/modules/cards/application/use-cases/delete-card/delete-card.use-case'
import { GetCardUseCase } from '@/modules/cards/application/use-cases/get-card/get-card.use-case'
import { GetCardsUseCase } from '@/modules/cards/application/use-cases/get-cards/get-cards.use-case'
import { GetInvoicePaymentSummaryUseCase } from '@/modules/cards/application/use-cases/get-invoice-payment-summary/get-invoice-payment-summary.use-case'
import { GetMonthTotalAmountUseCase } from '@/modules/cards/application/use-cases/get-month-total-amount/get-month-total-amount.use-case'
import { GetPurchasesUseCase } from '@/modules/cards/application/use-cases/get-purchases/get-purchases.use-case'
import { GetTotalAmountUsedUseCase } from '@/modules/cards/application/use-cases/get-total-amount-used/get-total-amount-used.use-case'
import { UpdateCardUseCase } from '@/modules/cards/application/use-cases/update-card/update-card.use-case'
import { CreateCardController } from '@/modules/cards/http/controllers/create-card.controller'
import { DeleteCardController } from '@/modules/cards/http/controllers/delete-card.controller'
import { GetCardController } from '@/modules/cards/http/controllers/get-card.controller'
import { GetCardsController } from '@/modules/cards/http/controllers/get-cards.controller'
import { GetInvoicePaymentSummaryController } from '@/modules/cards/http/controllers/get-invoice-payment-summary.controller'
import { GetMonthTotalAmountController } from '@/modules/cards/http/controllers/get-month-total-amount.controller'
import { GetPurchasesController } from '@/modules/cards/http/controllers/get-purchases.controller'
import { GetTotalAmountUsedController } from '@/modules/cards/http/controllers/get-total-amount-used.controller'
import { UpdateCardController } from '@/modules/cards/http/controllers/update-card.controller'
import { cardsRoutes } from '@/modules/cards/http/routes'
import { CardsRepository } from '@/modules/cards/infra/cards.repository'

const repository = new CardsRepository(db)

const controllers = {
  createCard: new CreateCardController(new CreateCardUseCase(repository)),
  getCards: new GetCardsController(new GetCardsUseCase(repository)),
  getCard: new GetCardController(new GetCardUseCase(repository)),
  updateCard: new UpdateCardController(new UpdateCardUseCase(repository)),
  deleteCard: new DeleteCardController(new DeleteCardUseCase(repository)),
  getPurchases: new GetPurchasesController(new GetPurchasesUseCase(repository)),
  getTotalAmountUsed: new GetTotalAmountUsedController(new GetTotalAmountUsedUseCase(repository)),
  getMonthTotalAmount: new GetMonthTotalAmountController(
    new GetMonthTotalAmountUseCase(repository),
  ),
  getInvoicePaymentSummary: new GetInvoicePaymentSummaryController(
    new GetInvoicePaymentSummaryUseCase(repository),
  ),
}

export const cardsModule = cardsRoutes(controllers)
