import { z } from 'zod'

export const createSubscriptionDto = z.object({
  cardId: z.string(),
  memberId: z.string(),
  name: z.string().min(1),
  amount: z.coerce.number().int().positive().describe('Valor em centavos'),
  billingDay: z.coerce.number().int().min(1).max(31),
})

export const updateSubscriptionDto = z.object({
  name: z.string().min(1).optional(),
  amount: z.coerce.number().int().positive().optional(),
  billingDay: z.coerce.number().int().min(1).max(31).optional(),
  cardId: z.string().optional(),
  active: z.boolean().optional(),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionDto>
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionDto>
