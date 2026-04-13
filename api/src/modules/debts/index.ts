import { db } from '@/db'
import { debtsController } from '@/modules/debts/debts.controller'
import { DebtsRepository } from '@/modules/debts/debts.repository'
import { DebtsService } from '@/modules/debts/debts.service'

const repository = new DebtsRepository(db)
const service = new DebtsService(repository)

export const debtsModule = debtsController(service)
