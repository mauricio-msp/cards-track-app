import { z } from 'zod'

export const createPurchaseDto = z.object({
  cardId: z.string().uuid(),
  members: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      amount: z.coerce.number().int().positive(),
      startInstallment: z.coerce.number().int().min(1).optional(),
      endInstallment: z.coerce.number().int().min(1).optional().nullable(),
    }),
  ),
  category: z.string(),
  description: z.string(),
  installmentsCount: z.coerce.number().int().min(1),
  purchaseDate: z.string(),
  isRecurring: z.boolean().optional().default(false),
  billingDay: z.coerce.number().int().min(1).max(31).optional(),
})

export const anticipatePurchaseDto = z.object({
  anticipateCount: z.coerce.number().int().min(1),
})

export type CreatePurchaseInput = z.infer<typeof createPurchaseDto>
export type AnticipatePurchaseInput = z.infer<typeof anticipatePurchaseDto>
