import type { FastifyReply, FastifyRequest } from 'fastify'
import type { CreateMemberInput } from '@/modules/members/members.dto'
import { MemberAlreadyExistsError } from '@/modules/members/members.errors'
import type { CreateMemberUseCase } from './create-member.use-case'

export class CreateMemberController {
  constructor(private readonly useCase: CreateMemberUseCase) {}

  async handle(request: FastifyRequest<{ Body: CreateMemberInput }>, reply: FastifyReply) {
    try {
      const member = await this.useCase.execute(request.user.id, request.body)
      return reply.status(201).send({ member, message: 'Membro criado com sucesso!' })
    } catch (err) {
      if (err instanceof MemberAlreadyExistsError) {
        return reply.status(409).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao criar o membro' })
    }
  }
}
