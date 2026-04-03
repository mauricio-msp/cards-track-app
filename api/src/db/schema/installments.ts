import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { debts, invoices, members } from '@/db/schema'

export const installments = pgTable('installments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  debtId: text('debt_id')
    .notNull()
    .references(() => debts.id, { onDelete: 'cascade' }),

  invoiceId: text('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),

  memberId: text('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),

  number: integer('number').notNull(), // Ex: 1 (de 10)
  amount: integer('amount').notNull(), // Valor desta parcela específica

  paidAt: timestamp('paid_at'), // NULL = Pendente, Data = Pago
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
