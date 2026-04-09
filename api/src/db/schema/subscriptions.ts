import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { cards } from '@/db/schema/cards'
import { members } from '@/db/schema/members'
import { users } from '@/db/schema/users'

export const subscriptions = pgTable('subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  cardId: text('card_id')
    .notNull()
    .references(() => cards.id, { onDelete: 'cascade' }),

  memberId: text('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  amount: integer('amount').notNull(),
  billingDay: integer('billing_day').notNull(),

  active: boolean('active').notNull().default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})
