import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { cards } from '@/db/schema/cards'
import { members } from '@/db/schema/members'

export const memberPayments = pgTable(
  'member_payments',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'cascade' }),

    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),

    targetMonth: integer('target_month').notNull(),
    targetYear: integer('target_year').notNull(),

    amount: integer('amount').notNull(),
    paidAt: timestamp('paid_at').notNull(),
    description: text('description').notNull(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => [
    index('mp_member_card_period_idx').on(
      table.memberId,
      table.cardId,
      table.targetMonth,
      table.targetYear,
    ),
  ],
)
