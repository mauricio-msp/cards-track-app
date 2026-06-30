import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { cards } from '@/db/schema'

export const anticipationModeDto = z.enum(['none', 'gap', 'tail'])

export const createCardDto = z.object({
  name: z.string().min(3),
  limit: z.coerce.number().positive().describe('Limite total do cartão em centavos'),
  closingOffsetDays: z.coerce
    .number()
    .positive()
    .describe('Número de dias anteriores ao fechamento da fatura'),
  dueDay: z.coerce.number().positive().describe('Dia do fechamento da fatura'),
  anticipationMode: anticipationModeDto.default('gap'),
})

export const updateCardDto = z.object({
  limit: z.number().int().positive(),
  closingOffsetDays: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
  anticipationMode: anticipationModeDto.optional(),
})

export const cardPeriodQueryDto = z.object({
  month: z.coerce.number().int().min(0).max(11).optional(),
  year: z.coerce.number().int().optional(),
})

export const cardSchema = createSelectSchema(cards)

export type CreateCardInput = z.infer<typeof createCardDto>
export type UpdateCardInput = z.infer<typeof updateCardDto>
export type CardPeriodQuery = z.infer<typeof cardPeriodQueryDto>
export type Card = z.infer<typeof cardSchema>
export type CardSummary = Pick<Card, 'id' | 'name' | 'limit' | 'closingOffsetDays' | 'dueDay' | 'anticipationMode'>
