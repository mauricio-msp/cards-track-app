import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { users } from '@/db/schema'

export const cards = pgTable('cards', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => uuidv7()),

  ownerUserId: text('owner_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  limit: integer('limit').notNull(),
  closingOffsetDays: integer('closing_offset_days').notNull(),
  dueDay: integer('due_day').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
