import { z } from 'zod'

export const memberPaymentPeriodQueryDto = z.object({
  month: z.coerce.number().int().min(0).max(11),
  year: z.coerce.number().int().min(2000),
})

export const createMemberPaymentDto = z.object({
  targetMonth: z.number().int().min(0).max(11),
  targetYear: z.number().int().min(2000),
  amount: z.number().int().positive(),
  paidAt: z.string().datetime(),
  description: z.string().min(1).max(500),
})

export const updateMemberPaymentDto = z.object({
  amount: z.number().int().positive().optional(),
  paidAt: z.string().datetime().optional(),
  description: z.string().min(1).max(500).optional(),
})

export const memberPaymentResponseSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  cardId: z.string(),
  targetMonth: z.number(),
  targetYear: z.number(),
  amount: z.number(),
  paidAt: z.union([z.string(), z.date().transform(d => d.toISOString())]),
  description: z.string(),
  createdAt: z.union([z.string(), z.date().transform(d => d.toISOString())]),
})

export type CreateMemberPaymentInput = z.infer<typeof createMemberPaymentDto>
export type UpdateMemberPaymentInput = z.infer<typeof updateMemberPaymentDto>
export type MemberPaymentPeriodQuery = z.infer<typeof memberPaymentPeriodQueryDto>
