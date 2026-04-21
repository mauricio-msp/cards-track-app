import { db } from '@/db'
import { CardsRepository } from '@/modules/cards/cards.repository'
import { cardsRoutes } from '@/modules/cards/cards.routes'
import { CreateCardController } from './use-cases/create-card/create-card.controller'
import { CreateCardUseCase } from './use-cases/create-card/create-card.use-case'
import { DeleteCardController } from './use-cases/delete-card/delete-card.controller'
import { DeleteCardUseCase } from './use-cases/delete-card/delete-card.use-case'
import { GetCardController } from './use-cases/get-card/get-card.controller'
import { GetCardUseCase } from './use-cases/get-card/get-card.use-case'
import { GetCardDebtsController } from './use-cases/get-card-debts/get-card-debts.controller'
import { GetCardDebtsUseCase } from './use-cases/get-card-debts/get-card-debts.use-case'
import { GetCardsController } from './use-cases/get-cards/get-cards.controller'
import { GetCardsUseCase } from './use-cases/get-cards/get-cards.use-case'
import { GetMonthTotalAmountController } from './use-cases/get-month-total-amount/get-month-total-amount.controller'
import { GetMonthTotalAmountUseCase } from './use-cases/get-month-total-amount/get-month-total-amount.use-case'
import { GetTotalAmountUsedController } from './use-cases/get-total-amount-used/get-total-amount-used.controller'
import { GetTotalAmountUsedUseCase } from './use-cases/get-total-amount-used/get-total-amount-used.use-case'
import { UpdateCardController } from './use-cases/update-card/update-card.controller'
import { UpdateCardUseCase } from './use-cases/update-card/update-card.use-case'

const repository = new CardsRepository(db)

const controllers = {
  createCard: new CreateCardController(new CreateCardUseCase(repository)),
  getCards: new GetCardsController(new GetCardsUseCase(repository)),
  getCard: new GetCardController(new GetCardUseCase(repository)),
  updateCard: new UpdateCardController(new UpdateCardUseCase(repository)),
  deleteCard: new DeleteCardController(new DeleteCardUseCase(repository)),
  getCardDebts: new GetCardDebtsController(new GetCardDebtsUseCase(repository)),
  getTotalAmountUsed: new GetTotalAmountUsedController(new GetTotalAmountUsedUseCase(repository)),
  getMonthTotalAmount: new GetMonthTotalAmountController(
    new GetMonthTotalAmountUseCase(repository),
  ),
}

export const cardsModule = cardsRoutes(controllers)
