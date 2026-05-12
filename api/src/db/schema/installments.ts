import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { debts, invoices, members } from '@/db/schema'

export const installments = pgTable(
  'installments',
  {
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

    // Bridge column for new schema — populated by migration script, then made NOT NULL
    purchaseMemberId: text('purchase_member_id'),

    number: integer('number').notNull(),
    amount: integer('amount').notNull(),

    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => [
    index('installments_debt_id_idx').on(table.debtId),
    index('installments_invoice_id_idx').on(table.invoiceId),
    index('installments_paid_at_idx').on(table.paidAt),
  ],
)
