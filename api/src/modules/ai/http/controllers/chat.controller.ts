import type { FastifyBaseLogger, FastifyReply } from 'fastify'
import type { ChatUseCase } from '@/modules/ai/application/use-cases/chat/chat.use-case'
import type { ChatBody } from '@/modules/ai/http/dto/chat.dto'

export class ChatController {
  constructor(private readonly useCase: ChatUseCase) {}

  async handle(body: ChatBody, userId: string, origin: string | undefined, reply: FastifyReply, log: FastifyBaseLogger) {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': origin ?? '*',
      'Access-Control-Allow-Credentials': 'true',
    })
    reply.hijack()

    try {
      const stream = await this.useCase.execute({ userId, messages: body.messages })

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content
        if (token && !reply.raw.writableEnded) {
          reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`)
        }
      }

      if (!reply.raw.writableEnded) {
        reply.raw.write('data: [DONE]\n\n')
      }
    } catch (err) {
      log.error(err)
      if (!reply.raw.writableEnded) {
        reply.raw.write(`data: ${JSON.stringify({ error: 'Serviço de IA indisponível.' })}\n\n`)
      }
    } finally {
      if (!reply.raw.writableEnded) {
        reply.raw.end()
      }
    }
  }
}
