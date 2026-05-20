import { fastifyCors } from '@fastify/cors'
import { fastifyHelmet } from '@fastify/helmet'
import { fastifyRateLimit } from '@fastify/rate-limit'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'

import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { env } from '@/env'
import { auth } from '@/lib/auth'

import { aiModule } from '@/modules/ai'
import { cardsModule } from '@/modules/cards'
import { memberPaymentsModule } from '@/modules/member-payments'
import { membersModule, membersPublicModule } from '@/modules/members'
import { metricsModule } from '@/modules/metrics'
import { purchasesModule } from '@/modules/purchases'
import { subscriptionsModule } from '@/modules/subscriptions'

export const app = fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'debug' : 'info',
    transport:
      env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname', // Remove o que você não precisa ver toda hora
              colorize: true,
            },
          }
        : undefined, // Em produção, mantém o JSON puro por performance
  },
}).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Security headers
app.register(fastifyHelmet)

// Rate limiting — auth routes are most sensitive
app.register(fastifyRateLimit, {
  max: 60,
  timeWindow: '1 minute',
  keyGenerator: request => request.ip,
})

// Configure CORS policies
app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
})

// Set up Swagger for API documentation
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Card Track API',
      description: 'API documentation for the Card Track application',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

// Register Scalar API Reference for docs — only in non-production
if (env.NODE_ENV !== 'production') {
  app.register(ScalarApiReference, {
    routePrefix: '/docs',
  })
}

// Cards
app.register(cardsModule)
app.register(membersModule)
app.register(membersPublicModule)
app.register(metricsModule)
app.register(purchasesModule)

// Subscriptions
app.register(subscriptionsModule)
app.register(memberPaymentsModule)

// AI
app.register(aiModule)

// Proxy authentication requests to Better Auth
app.route({
  method: ['GET', 'POST'],
  url: '/api/auth/*',
  async handler(request, reply) {
    try {
      // Construct request URL
      const url = new URL(request.url, `http://${request.headers.host}`)

      // Convert Fastify headers to standard Headers object
      const headers = new Headers()
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString())
      })

      // Create Fetch API-compatible request
      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        ...(request.body ? { body: JSON.stringify(request.body) } : {}),
      })

      // Process authentication request
      const response = await auth.handler(req)

      // Forward response to client
      reply.status(response.status)
      response.headers.forEach((value, key) => reply.header(key, value))
      reply.send(response.body ? await response.text() : null)
    } catch (error) {
      app.log.error({ error }, 'Authentication Error')
      reply.status(500).send({
        error: 'Internal authentication error',
        code: 'AUTH_FAILURE',
      })
    }
  },
})
