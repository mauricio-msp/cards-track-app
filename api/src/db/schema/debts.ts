import { date, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { cards, invoices, members } from '@/db/schema'
import { subscriptions } from '@/db/schema/subscriptions'

export const debts = pgTable(
  'debts',
  {
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

    amount: integer('amount').notNull(),
    installmentsCount: integer('installments_count').notNull(),
    installmentsAmount: integer('installments_amount').notNull(),

    startInstallment: integer('start_installment').notNull().default(1),
    endInstallment: integer('end_installment'),

    purchaseDate: date('purchase_date').notNull(),

    invoiceId: text('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    invoiceYear: integer('invoice_year').notNull(),
    invoiceMonth: integer('invoice_month').notNull(), // 0–11

    anticipatedAt: timestamp('anticipated_at'),
    anticipateFromInstallment: integer('anticipate_from_installment'),
    subscriptionId: text('subscription_id').references(() => subscriptions.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => [
    index('debts_group_id_idx').on(table.groupId),
    index('debts_card_id_idx').on(table.cardId),
    index('debts_member_id_idx').on(table.memberId),
    index('debts_invoice_id_idx').on(table.invoiceId),
  ],
)
