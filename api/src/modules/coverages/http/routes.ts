import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { authMiddleware } from '@/middleware/auth'
import type { CreateCoverageController } from '@/modules/coverages/http/controllers/create-coverage.controller'
import type { DeleteCoverageController } from '@/modules/coverages/http/controllers/delete-coverage.controller'
import type { GetAllCoveragesController } from '@/modules/coverages/http/controllers/get-all-coverages.controller'
import type { GetCoveragesController } from '@/modules/coverages/http/controllers/get-coverages.controller'
import type { UpdateCoverageRepaymentController } from '@/modules/coverages/http/controllers/update-coverage-repayment.controller'
import {
  allCoveragesQueryDto,
  allCoveragesSummaryResponseSchema,
  coveragePeriodQueryDto,
  coverageResponseSchema,
  createCoverageDto,
  updateCoverageRepaymentDto,
} from '@/modules/coverages/http/dto/coverages.dto'

type Controllers = {
  getCoverages: GetCoveragesController
  getAllCoverages: GetAllCoveragesController
  createCoverage: CreateCoverageController
  deleteCoverage: DeleteCoverageController
  updateCoverageRepayment: UpdateCoverageRepaymentController
}

const paramsSchema = z.object({
  memberId: z.string(),
  cardId: z.string(),
})

const coverageParamsSchema = z.object({
  memberId: z.string(),
  cardId: z.string(),
  coverageId: z.string(),
})

const coveragesResponseSchema = z.object({
  coverages: z.array(coverageResponseSchema),
  totalCovered: z.number(),
  totalRepaid: z.number(),
  totalRemaining: z.number(),
})

export const coveragesRoutes =
  (controllers: Controllers): FastifyPluginAsyncZod =>
  async app => {
    app.get(
      '/api/coverages',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Lista todas as coberturas do usuário autenticado por período',
          tags: ['Coverages'],
          querystring: allCoveragesQueryDto,
          response: {
            200: allCoveragesSummaryResponseSchema,
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.getAllCoverages.handle(req.user.id, req.query, reply, req.log),
    )

    app.get(
      '/api/members/:memberId/cards/:cardId/coverages',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Lista coberturas de um membro em um cartão por período',
          tags: ['Coverages'],
          params: paramsSchema,
          querystring: coveragePeriodQueryDto,
          response: {
            200: coveragesResponseSchema,
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.getCoverages.handle(
          req.params.memberId,
          req.params.cardId,
          req.query,
          reply,
          req.log,
        ),
    )

    app.post(
      '/api/members/:memberId/cards/:cardId/coverages',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Registra cobertura de fatura de membro',
          tags: ['Coverages'],
          params: paramsSchema,
          body: createCoverageDto,
          response: {
            201: z.object({ coverage: coverageResponseSchema, message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.createCoverage.handle(
          req.params.memberId,
          req.params.cardId,
          req.body,
          reply,
          req.log,
        ),
    )

    app.delete(
      '/api/members/:memberId/cards/:cardId/coverages/:coverageId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Remove uma cobertura',
          tags: ['Coverages'],
          params: coverageParamsSchema,
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.deleteCoverage.handle(req.params.coverageId, reply, req.log),
    )

    app.patch(
      '/api/members/:memberId/cards/:cardId/coverages/:coverageId/repayment',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Atualiza quitação de cobertura (parcial ou total)',
          tags: ['Coverages'],
          params: coverageParamsSchema,
          body: updateCoverageRepaymentDto,
          response: {
            200: z.object({ coverage: coverageResponseSchema, message: z.string() }),
            404: z.object({ message: z.string() }),
            422: z.object({ message: z.string() }),
            500: z.object({ message: z.string() }),
          },
        },
      },
      (req, reply) =>
        controllers.updateCoverageRepayment.handle(
          req.params.coverageId,
          req.body,
          reply,
          req.log,
        ),
    )
  }
