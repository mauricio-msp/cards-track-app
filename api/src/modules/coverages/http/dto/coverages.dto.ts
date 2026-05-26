import { z } from 'zod'

export const coveragePeriodQueryDto = z.object({
  month: z.coerce.number().int().min(0).max(11),
  year: z.coerce.number().int().min(2000),
})

export const createCoverageDto = z.object({
  targetMonth: z.number().int().min(0).max(11),
  targetYear: z.number().int().min(2000),
  amount: z.number().int().positive(),
  coveredAt: z.string().datetime(),
  description: z.string().min(1).max(500).optional(),
})

export const updateCoverageRepaymentDto = z.object({
  amountRepaid: z.number().int().min(0).optional(),
  settled: z.boolean().optional(),
})

export const coverageResponseSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  cardId: z.string(),
  targetMonth: z.number(),
  targetYear: z.number(),
  amount: z.number(),
  coveredAt: z.union([z.string(), z.date().transform(d => d.toISOString())]),
  description: z.string().nullable(),
  amountRepaid: z.number(),
  settledAt: z.union([z.string(), z.date().transform(d => d.toISOString())]).nullable(),
  remaining: z.number(),
  createdAt: z.union([z.string(), z.date().transform(d => d.toISOString())]),
})

export type CreateCoverageInput = z.infer<typeof createCoverageDto>
export type UpdateCoverageRepaymentInput = z.infer<typeof updateCoverageRepaymentDto>
export type CoveragePeriodQuery = z.infer<typeof coveragePeriodQueryDto>

export const allCoveragesQueryDto = z.object({
  month: z.coerce.number().int().min(0).max(11).optional(),
  year: z.coerce.number().int().min(2000).optional(),
})

export const allCoverageItemSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  memberName: z.string(),
  cardId: z.string(),
  cardName: z.string(),
  targetMonth: z.number(),
  targetYear: z.number(),
  amount: z.number(),
  amountRepaid: z.number(),
  remaining: z.number(),
  settledAt: z.union([z.string(), z.date().transform(d => d.toISOString())]).nullable(),
})

export const allCoveragesSummaryResponseSchema = z.object({
  coverages: z.array(allCoverageItemSchema),
  totalCovered: z.number(),
  totalRepaid: z.number(),
  totalRemaining: z.number(),
})

export type AllCoveragesQuery = z.infer<typeof allCoveragesQueryDto>
