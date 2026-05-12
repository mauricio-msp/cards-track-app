import { db } from '@/db'
import { GetMonthHighestAmountUseCase } from '@/modules/metrics/application/use-cases/get-month-highest-amount/get-month-highest-amount.use-case'
import { GetMonthLowestAmountUseCase } from '@/modules/metrics/application/use-cases/get-month-lowest-amount/get-month-lowest-amount.use-case'
import { GetMonthTotalAmountUseCase } from '@/modules/metrics/application/use-cases/get-month-total-amount/get-month-total-amount.use-case'
import { GetTotalAmountUseCase } from '@/modules/metrics/application/use-cases/get-total-amount/get-total-amount.use-case'
import { GetTrendUseCase } from '@/modules/metrics/application/use-cases/get-trend/get-trend.use-case'
import { GetYearsUseCase } from '@/modules/metrics/application/use-cases/get-years/get-years.use-case'
import { GetMonthHighestAmountController } from '@/modules/metrics/http/controllers/get-month-highest-amount.controller'
import { GetMonthLowestAmountController } from '@/modules/metrics/http/controllers/get-month-lowest-amount.controller'
import { GetMonthTotalAmountController } from '@/modules/metrics/http/controllers/get-month-total-amount.controller'
import { GetTotalAmountController } from '@/modules/metrics/http/controllers/get-total-amount.controller'
import { GetTrendController } from '@/modules/metrics/http/controllers/get-trend.controller'
import { GetYearsController } from '@/modules/metrics/http/controllers/get-years.controller'
import { metricsRoutes } from '@/modules/metrics/http/routes'
import { MetricsRepository } from '@/modules/metrics/infra/metrics.repository'

const repository = new MetricsRepository(db)

const controllers = {
  getTrend: new GetTrendController(new GetTrendUseCase(repository)),
  getYears: new GetYearsController(new GetYearsUseCase(repository)),
  getMonthHighestAmount: new GetMonthHighestAmountController(
    new GetMonthHighestAmountUseCase(repository),
  ),
  getMonthLowestAmount: new GetMonthLowestAmountController(
    new GetMonthLowestAmountUseCase(repository),
  ),
  getMonthTotalAmount: new GetMonthTotalAmountController(
    new GetMonthTotalAmountUseCase(repository),
  ),
  getTotalAmount: new GetTotalAmountController(new GetTotalAmountUseCase(repository)),
}

export const metricsModule = metricsRoutes(controllers)
