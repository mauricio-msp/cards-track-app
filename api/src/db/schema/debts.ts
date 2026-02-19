import { date, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { cards, members } from '@/db/schema'

export const debts = pgTable('debts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  groupId: text('group_id').notNull(),

  cardId: text('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),

  memberId: text('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),

  category: text('category'),
  description: text('description').notNull(),

  amount: integer('amount').notNull(), // total da dívida
  installmentsCount: integer('installments_count').notNull(),
  installmentsAmount: integer('installments_amount').notNull(),

  // A parcela inicial (ex: 1)
  startInstallment: integer('start_installment').notNull().default(1),
  endInstallment: integer('end_installment'),

  purchaseDate: date('purchase_date').notNull(),

  // 🔑 NOVOS CAMPOS (ESSENCIAIS)
  invoiceYear: integer('invoice_year').notNull(),
  invoiceMonth: integer('invoice_month').notNull(), // 0–11

  createdAt: timestamp('created_at').notNull().defaultNow(),
})
