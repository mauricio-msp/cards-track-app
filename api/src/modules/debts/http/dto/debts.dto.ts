import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { debts } from '@/db/schema'

export const createDebtDto = z.object({
  cardId: z.string().describe('ID do cartão utilizado'),
  members: z.array(
    z.object({
      id: z.string().describe('ID do membro da família/grupo'),
      name: z.string(),
      amount: z.coerce.number().int().positive().describe('Valor total que este membro deve pagar'),
      startInstallment: z.coerce
        .number()
        .int()
        .min(1)
        .optional()
        .describe('Parcela inicial do membro'),
      endInstallment: z.coerce
        .number()
        .int()
        .min(1)
        .optional()
        .nullable()
        .describe('Parcela final do membro'),
    }),
  ),
  category: z.string().describe('Categoria da despesa (ex: Alimentação)'),
  description: z.string().describe('Descrição da compra'),
  installmentsCount: z.coerce
    .number()
    .int()
    .min(1)
    .describe('Quantidade total de parcelas da compra'),
  purchaseDate: z.string().describe('Data da compra (ISO string)'),
  isRecurring: z.boolean().optional().default(false),
  billingDay: z.coerce.number().int().min(1).max(31).optional(),
})

export const anticipateDebtDto = z.object({
  anticipateFromInstallment: z.coerce
    .number()
    .int()
    .min(1)
    .describe('Número da parcela a partir da qual antecipar (inclusive)'),
})

export const debtSchema = createSelectSchema(debts)

export type CreateDebtInput = z.infer<typeof createDebtDto>
export type AnticipateDebtInput = z.infer<typeof anticipateDebtDto>
