import { fastifyCors } from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import ScalarApiReference from '@scalar/fastify-api-reference'

import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { auth } from '@/lib/auth'
import { cardRoutes } from '@/routes/credit-card'
import { debtsRoutes } from '@/routes/debts'
import { installmentRoutes } from '@/routes/installment'
import { memberRoutes } from '@/routes/members'

export const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

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

// Register Scalar API Reference for docs
app.register(ScalarApiReference, {
  routePrefix: '/docs',
})

// Card
app.register(cardRoutes)

// Installments
app.register(installmentRoutes)

// Members
app.register(memberRoutes)

// Debts/Overview
app.register(debtsRoutes)

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
