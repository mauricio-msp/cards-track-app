import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { invoices, members } from '@/db/schema'

export const installments = pgTable(
  'installments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    invoiceId: text('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),

    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),

    purchaseMemberId: text('purchase_member_id'),

    number: integer('number').notNull(),
    amount: integer('amount').notNull(),

    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => [
    index('installments_invoice_id_idx').on(table.invoiceId),
    index('installments_paid_at_idx').on(table.paidAt),
  ],
)
