import Fastify from 'fastify'
import { describe, expect, it, vi } from 'vitest'
import { registerObservability } from '@/plugins/observability'

// env.ts calls EnvSchema.parse(process.env) at import time — required vars would be missing in test.
// Mock the entire module so the import doesn't throw.
vi.mock('@/env', () => ({
  env: {
    NODE_ENV: 'test',
    OBSERVABILITY_SLOW_HTTP_MS: 500,
    OBSERVABILITY_SLOW_QUERY_MS: 100,
  },
}))

function buildApp(opts: { slowHttpMs?: number } = {}) {
  const logs: Record<string, unknown>[] = []
  const app = Fastify({
    logger: {
      level: 'debug',
      stream: { write: (line: string) => logs.push(JSON.parse(line)) },
    },
  })
  registerObservability(app, {
    slowHttpMs: opts.slowHttpMs ?? 500,
    systemMetricsIntervalMs: 999_999, // prevent interval from firing during tests
  })
  return { app, logs }
}

describe('HTTP latency logging', () => {
  it('logs type=http on every response', async () => {
    const { app, logs } = buildApp()
    app.get('/ping', async () => ({ ok: true }))
    await app.ready()

    await app.inject({ method: 'GET', url: '/ping' })

    const entry = logs.find(l => l['type'] === 'http')
    expect(entry).toBeDefined()
    expect(entry).toMatchObject({
      type: 'http',
      method: 'GET',
      route: '/ping',
      statusCode: 200,
    })
    expect(typeof entry!['durationMs']).toBe('number')
    expect(entry!['durationMs']).toBeGreaterThanOrEqual(0)
  })

  it('logs warn level when durationMs exceeds threshold', async () => {
    const { app, logs } = buildApp({ slowHttpMs: 0 }) // threshold 0 → always slow
    app.get('/slow', async () => ({ ok: true }))
    await app.ready()

    await app.inject({ method: 'GET', url: '/slow' })

    const entry = logs.find(l => l['type'] === 'http') as Record<string, unknown>
    expect(entry).toBeDefined()
    expect(entry['level']).toBe(40) // pino warn = 40
  })

  it('logs info level when durationMs is within threshold', async () => {
    const { app, logs } = buildApp({ slowHttpMs: 999_999 }) // threshold very high → always fast
    app.get('/fast', async () => ({ ok: true }))
    await app.ready()

    await app.inject({ method: 'GET', url: '/fast' })

    const entry = logs.find(l => l['type'] === 'http') as Record<string, unknown>
    expect(entry).toBeDefined()
    expect(entry['level']).toBe(30) // pino info = 30
  })

  it('logs route pattern not real param value', async () => {
    const { app, logs } = buildApp()
    app.get('/items/:id', async () => ({ ok: true }))
    await app.ready()

    await app.inject({ method: 'GET', url: '/items/abc-123' })

    const entry = logs.find(l => l['type'] === 'http') as Record<string, unknown>
    expect(entry!['route']).toBe('/items/:id')
  })
})

describe('health endpoint', () => {
  it('exposes GET /api/health returning 200', async () => {
    const { app } = buildApp()
    await app.ready()

    const response = await app.inject({ method: 'GET', url: '/api/health' })
    expect(response.statusCode).toBe(200)
  })
})
