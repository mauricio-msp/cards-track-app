import { index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { users } from '@/db/schema/users'

export const members = pgTable(
  'members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),
    phone: text('phone'),
    relationship: text('relationship').notNull(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  table => [
    uniqueIndex('members_user_name_unique').on(table.userId, table.name),
    index('members_user_id_idx').on(table.userId),
  ],
)
