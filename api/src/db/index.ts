import { performance } from 'node:perf_hooks'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool, type QueryConfig, type QueryResult, type QueryResultRow } from 'pg'
import pino from 'pino'

import * as schema from '@/db/schema'
import { env } from '@/env'

const SLOW_QUERY_MS = env.OBSERVABILITY_SLOW_QUERY_MS

const dbLogger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
})

class TimedPool extends Pool {
  // @ts-expect-error — Pool.query has many callback overloads that can't all be matched in a single override; Drizzle only uses the Promise form.
  override query<R extends QueryResultRow = QueryResultRow>(
    queryTextOrConfig: string | QueryConfig,
    values?: unknown[],
  ): Promise<QueryResult<R>> {
    const start = performance.now()
    const result = super.query<R>(queryTextOrConfig as string, values as string[])
    result
      .then(() => {
        const durationMs = Math.round(performance.now() - start)
        const sql =
          typeof queryTextOrConfig === 'string' ? queryTextOrConfig : queryTextOrConfig.text
        const level = durationMs > SLOW_QUERY_MS ? 'warn' : 'debug'
        dbLogger[level]({ type: 'db_query', durationMs, sql })
      })
      .catch(() => {})
    return result
  }
}

const pool = new TimedPool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export const db = drizzle(pool as Pool, {
  schema,
  casing: 'snake_case',
})
