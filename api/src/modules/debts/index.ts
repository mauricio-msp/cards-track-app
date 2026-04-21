import { db } from '@/db'
import { DebtsRepository } from '@/modules/debts/debts.repository'
import { debtsRoutes } from '@/modules/debts/debts.routes'
import { AnticipateDebtController } from './use-cases/anticipate-debt/anticipate-debt.controller'
import { AnticipateDebtUseCase } from './use-cases/anticipate-debt/anticipate-debt.use-case'
import { CreateDebtController } from './use-cases/create-debt/create-debt.controller'
import { CreateDebtUseCase } from './use-cases/create-debt/create-debt.use-case'
import { DeleteDebtController } from './use-cases/delete-debt/delete-debt.controller'
import { DeleteDebtUseCase } from './use-cases/delete-debt/delete-debt.use-case'
import { DeleteDebtMemberController } from './use-cases/delete-debt-member/delete-debt-member.controller'
import { DeleteDebtMemberUseCase } from './use-cases/delete-debt-member/delete-debt-member.use-case'
import { GetDebtsTrendController } from './use-cases/get-debts-trend/get-debts-trend.controller'
import { GetDebtsTrendUseCase } from './use-cases/get-debts-trend/get-debts-trend.use-case'
import { GetDebtsYearsController } from './use-cases/get-debts-years/get-debts-years.controller'
import { GetDebtsYearsUseCase } from './use-cases/get-debts-years/get-debts-years.use-case'
import { GetMonthHighestDebtsAmountController } from './use-cases/get-month-highest-debts-amount/get-month-highest-debts-amount.controller'
import { GetMonthHighestDebtsAmountUseCase } from './use-cases/get-month-highest-debts-amount/get-month-highest-debts-amount.use-case'
import { GetMonthLowestDebtsAmountController } from './use-cases/get-month-lowest-debts-amount/get-month-lowest-debts-amount.controller'
import { GetMonthLowestDebtsAmountUseCase } from './use-cases/get-month-lowest-debts-amount/get-month-lowest-debts-amount.use-case'
import { GetMonthTotalDebtsAmountController } from './use-cases/get-month-total-debts-amount/get-month-total-debts-amount.controller'
import { GetMonthTotalDebtsAmountUseCase } from './use-cases/get-month-total-debts-amount/get-month-total-debts-amount.use-case'
import { GetTotalDebtsAmountController } from './use-cases/get-total-debts-amount/get-total-debts-amount.controller'
import { GetTotalDebtsAmountUseCase } from './use-cases/get-total-debts-amount/get-total-debts-amount.use-case'

const repository = new DebtsRepository(db)

const controllers = {
  createDebt: new CreateDebtController(new CreateDebtUseCase(repository)),
  deleteDebt: new DeleteDebtController(new DeleteDebtUseCase(repository)),
  deleteDebtMember: new DeleteDebtMemberController(new DeleteDebtMemberUseCase(repository)),
  anticipateDebt: new AnticipateDebtController(new AnticipateDebtUseCase(repository)),
  getDebtsTrend: new GetDebtsTrendController(new GetDebtsTrendUseCase(repository)),
  getDebtsYears: new GetDebtsYearsController(new GetDebtsYearsUseCase(repository)),
  getMonthHighestDebtsAmount: new GetMonthHighestDebtsAmountController(
    new GetMonthHighestDebtsAmountUseCase(repository),
  ),
  getMonthLowestDebtsAmount: new GetMonthLowestDebtsAmountController(
    new GetMonthLowestDebtsAmountUseCase(repository),
  ),
  getMonthTotalDebtsAmount: new GetMonthTotalDebtsAmountController(
    new GetMonthTotalDebtsAmountUseCase(repository),
  ),
  getTotalDebtsAmount: new GetTotalDebtsAmountController(
    new GetTotalDebtsAmountUseCase(repository),
  ),
}

export const debtsModule = debtsRoutes(controllers)
