import { db } from '@/db'
import { AnticipateDebtUseCase } from '@/modules/debts/application/use-cases/anticipate-debt/anticipate-debt.use-case'
import { CreateDebtUseCase } from '@/modules/debts/application/use-cases/create-debt/create-debt.use-case'
import { DeleteDebtUseCase } from '@/modules/debts/application/use-cases/delete-debt/delete-debt.use-case'
import { DeleteDebtMemberUseCase } from '@/modules/debts/application/use-cases/delete-debt-member/delete-debt-member.use-case'
import { GetDebtsTrendUseCase } from '@/modules/debts/application/use-cases/get-debts-trend/get-debts-trend.use-case'
import { GetDebtsYearsUseCase } from '@/modules/debts/application/use-cases/get-debts-years/get-debts-years.use-case'
import { GetMonthHighestDebtsAmountUseCase } from '@/modules/debts/application/use-cases/get-month-highest-debts-amount/get-month-highest-debts-amount.use-case'
import { GetMonthLowestDebtsAmountUseCase } from '@/modules/debts/application/use-cases/get-month-lowest-debts-amount/get-month-lowest-debts-amount.use-case'
import { GetMonthTotalDebtsAmountUseCase } from '@/modules/debts/application/use-cases/get-month-total-debts-amount/get-month-total-debts-amount.use-case'
import { GetTotalDebtsAmountUseCase } from '@/modules/debts/application/use-cases/get-total-debts-amount/get-total-debts-amount.use-case'
import { AnticipateDebtController } from '@/modules/debts/http/controllers/anticipate-debt.controller'
import { CreateDebtController } from '@/modules/debts/http/controllers/create-debt.controller'
import { DeleteDebtController } from '@/modules/debts/http/controllers/delete-debt.controller'
import { DeleteDebtMemberController } from '@/modules/debts/http/controllers/delete-debt-member.controller'
import { GetDebtsTrendController } from '@/modules/debts/http/controllers/get-debts-trend.controller'
import { GetDebtsYearsController } from '@/modules/debts/http/controllers/get-debts-years.controller'
import { GetMonthHighestDebtsAmountController } from '@/modules/debts/http/controllers/get-month-highest-debts-amount.controller'
import { GetMonthLowestDebtsAmountController } from '@/modules/debts/http/controllers/get-month-lowest-debts-amount.controller'
import { GetMonthTotalDebtsAmountController } from '@/modules/debts/http/controllers/get-month-total-debts-amount.controller'
import { GetTotalDebtsAmountController } from '@/modules/debts/http/controllers/get-total-debts-amount.controller'
import { debtsRoutes } from '@/modules/debts/http/routes'
import { DebtsRepository } from '@/modules/debts/infra/debts.repository'

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
