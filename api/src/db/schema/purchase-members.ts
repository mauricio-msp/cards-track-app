import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { members } from '@/db/schema/members'
import { purchases } from '@/db/schema/purchases'

export const purchaseMembers = pgTable(
  'purchase_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    purchaseId: text('purchase_id')
      .notNull()
      .references(() => purchases.id, { onDelete: 'cascade' }),

    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),

    // Total this member owes across their active installments
    amount: integer('amount').notNull(),
    // Per-installment value for this member
    installmentAmount: integer('installment_amount').notNull(),

    startInstallment: integer('start_installment').notNull().default(1),
    endInstallment: integer('end_installment'),

    anticipatedAt: timestamp('anticipated_at'),
    anticipateFromInstallment: integer('anticipate_from_installment'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => [
    index('pm_purchase_id_idx').on(table.purchaseId),
    index('pm_member_id_idx').on(table.memberId),
  ],
)
