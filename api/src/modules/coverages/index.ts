import { db } from '@/db'
import { CreateCoverageUseCase } from '@/modules/coverages/application/use-cases/create-coverage/create-coverage.use-case'
import { DeleteCoverageUseCase } from '@/modules/coverages/application/use-cases/delete-coverage/delete-coverage.use-case'
import { GetAllCoveragesUseCase } from '@/modules/coverages/application/use-cases/get-all-coverages/get-all-coverages.use-case'
import { GetCoveragesUseCase } from '@/modules/coverages/application/use-cases/get-coverages/get-coverages.use-case'
import { UpdateCoverageRepaymentUseCase } from '@/modules/coverages/application/use-cases/update-coverage-repayment/update-coverage-repayment.use-case'
import { CreateCoverageController } from '@/modules/coverages/http/controllers/create-coverage.controller'
import { DeleteCoverageController } from '@/modules/coverages/http/controllers/delete-coverage.controller'
import { GetAllCoveragesController } from '@/modules/coverages/http/controllers/get-all-coverages.controller'
import { GetCoveragesController } from '@/modules/coverages/http/controllers/get-coverages.controller'
import { UpdateCoverageRepaymentController } from '@/modules/coverages/http/controllers/update-coverage-repayment.controller'
import { coveragesRoutes } from '@/modules/coverages/http/routes'
import { CoveragesRepository } from '@/modules/coverages/infra/coverages.repository'

const repository = new CoveragesRepository(db)

const controllers = {
  getCoverages: new GetCoveragesController(new GetCoveragesUseCase(repository)),
  getAllCoverages: new GetAllCoveragesController(new GetAllCoveragesUseCase(repository)),
  createCoverage: new CreateCoverageController(new CreateCoverageUseCase(repository)),
  deleteCoverage: new DeleteCoverageController(new DeleteCoverageUseCase(repository)),
  updateCoverageRepayment: new UpdateCoverageRepaymentController(
    new UpdateCoverageRepaymentUseCase(repository),
  ),
}

export const coveragesModule = coveragesRoutes(controllers)
