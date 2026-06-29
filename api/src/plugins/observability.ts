import { performance } from 'node:perf_hooks'
import underPressure from '@fastify/under-pressure'
import type { FastifyInstance } from 'fastify'
import { env } from '@/env'

export interface ObservabilityOptions {
  slowHttpMs?: number
  systemMetricsIntervalMs?: number
}

export function registerObservability(
  app: FastifyInstance,
  opts: ObservabilityOptions = {},
): void {
  const slowHttpMs = opts.slowHttpMs ?? env.OBSERVABILITY_SLOW_HTTP_MS
  const systemMetricsIntervalMs = opts.systemMetricsIntervalMs ?? 60_000

  app.addHook('onRequest', (req, _reply, done) => {
    req.startTime = performance.now()
    done()
  })

  app.addHook('onResponse', (req, reply, done) => {
    const durationMs = Math.round(performance.now() - req.startTime)
    const level = durationMs >= slowHttpMs ? 'warn' : 'info'
    req.log[level]({
      type: 'http',
      method: req.method,
      route: req.routeOptions?.url ?? req.url,
      statusCode: reply.statusCode,
      durationMs,
    })
    done()
  })

  app.register(underPressure, {
    maxEventLoopDelay: 1000,
    maxHeapUsedBytes: 300_000_000,
    exposeStatusRoute: '/api/health',
  })

  setInterval(() => {
    const mem = process.memoryUsage()
    const cpu = process.cpuUsage()
    app.log.info({
      type: 'system',
      heapUsedMb: Math.round(mem.heapUsed / 1_048_576),
      heapTotalMb: Math.round(mem.heapTotal / 1_048_576),
      rssMb: Math.round(mem.rss / 1_048_576),
      cpuUserMs: Math.round(cpu.user / 1000),
      cpuSysMs: Math.round(cpu.system / 1000),
    })
  }, systemMetricsIntervalMs).unref()
}
