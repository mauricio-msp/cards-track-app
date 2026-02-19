import type { FastifyReply, FastifyRequest } from 'fastify'
import { auth } from '@/lib/auth'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session || !session.user) {
    return reply.status(401).send({
      message: 'Unauthorized',
    })
  }

  // 🔑 injeta o usuário logado na request
  request.user = session.user
}
