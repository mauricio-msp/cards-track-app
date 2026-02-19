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

import { createCard } from '@/routes/create-card'
import { createDebt } from '@/routes/create-debt'
import { createMember } from '@/routes/create-member'

import { getCard } from '@/routes/get-card'
import { getCardDebts } from '@/routes/get-card-debts'
import { getCards } from '@/routes/get-cards'
import { getDebtsYearlyEvolution } from '@/routes/get-debts-yearly-evolution'
import { getMember } from '@/routes/get-member'
import { getMemberDebts } from '@/routes/get-member-debts'
import { getMembers } from '@/routes/get-members'
import { getMonthHighestDebtsAmount } from '@/routes/get-month-highest-debts-amount'
import { getMonthLowestDebtsAmount } from '@/routes/get-month-lowest-debts-amount'
import { getMonthTotalAmountCard } from '@/routes/get-month-total-amount-card'
import { getMonthTotalDebtsAmount } from '@/routes/get-month-total-debts-amount'
import { getTotalAmountCard } from '@/routes/get-total-amount-card'
import { getTotalDebtsAmount } from '@/routes/get-total-debts-amount'

export const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Configure CORS policies
app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Create Registers
app.register(createCard)
app.register(createDebt)
app.register(createMember)

// Card
app.register(getCard)
app.register(getCards)
app.register(getCardDebts)
app.register(getTotalAmountCard)
app.register(getMonthTotalAmountCard)

// Members
app.register(getMember)
app.register(getMembers)
app.register(getMemberDebts)

// Overview
app.register(getTotalDebtsAmount)
app.register(getMonthTotalDebtsAmount)
app.register(getMonthLowestDebtsAmount)
app.register(getMonthHighestDebtsAmount)

// Charts
app.register(getDebtsYearlyEvolution)

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
