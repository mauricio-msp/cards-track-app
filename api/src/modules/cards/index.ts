import { db } from '@/db'
import { cardsController } from '@/modules/cards/cards.controller'
import { CardsRepository } from '@/modules/cards/cards.repository'
import { CardsService } from '@/modules/cards/cards.service'

const repository = new CardsRepository(db)
const service = new CardsService(repository)

export const cardsModule = cardsController(service)
