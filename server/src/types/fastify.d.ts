import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      createdAt: Date
      updatedAt: Date
      email: string
      emailVerified: boolean
      name: string
      image?: string | null | undefined
    }
  }
}
