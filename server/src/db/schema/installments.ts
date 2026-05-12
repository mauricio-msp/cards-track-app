import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { invoices } from '@/db/schema/invoices'
import { purchaseMembers } from '@/db/schema/purchase-members'

export const installments = pgTable(
  'installments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    purchaseMemberId: text('purchase_member_id')
      .notNull()
      .references(() => purchaseMembers.id, { onDelete: 'cascade' }),

    invoiceId: text('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),

    number: integer('number').notNull(),
    amount: integer('amount').notNull(),

    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => [
    index('installments_pm_id_idx').on(table.purchaseMemberId),
    index('installments_invoice_id_idx').on(table.invoiceId),
    // Partial index (WHERE paid_at IS NULL) must be added via raw SQL in migration
    index('installments_paid_at_idx').on(table.paidAt),
  ],
)
