import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { members } from '@/db/schema'

export const createMemberDto = z.object({
  name: z.string().min(3),
  phone: z.string().nullish(),
  relationship: z.string(),
})

export const updateMemberDto = z.object({
  phone: z.string().nullish(),
  relationship: z.string().optional(),
})

export const getMemberDebtsQueryDto = z.object({
  month: z.coerce.number().int().min(0).max(11).optional(),
  year: z.coerce.number().int().optional(),
})

export const memberSchema = createSelectSchema(members)

export type CreateMemberInput = z.infer<typeof createMemberDto>
export type UpdateMemberInput = z.infer<typeof updateMemberDto>
export type GetMemberDebtsQuery = z.infer<typeof getMemberDebtsQueryDto>
export type Member = z.infer<typeof memberSchema>
