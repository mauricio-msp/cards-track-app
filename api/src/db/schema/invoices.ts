import { integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { cards } from '@/db/schema'

export const invoices = pgTable(
  'invoices',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),

    month: integer('month').notNull(), // 0-11
    year: integer('year').notNull(),
    dueDate: timestamp('due_date').notNull(), // Vencimento "congelado" nesta fatura
    status: text('status', { enum: ['open', 'closed', 'paid'] }).default('open'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    unq: uniqueIndex('card_month_year_idx').on(table.cardId, table.month, table.year),
  }),
)
