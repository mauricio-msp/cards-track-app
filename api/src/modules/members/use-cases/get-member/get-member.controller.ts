import type { FastifyReply, FastifyRequest } from 'fastify'
import { MemberNotFoundError } from '@/modules/members/members.errors'
import type { GetMemberUseCase } from './get-member.use-case'

export class GetMemberController {
  constructor(private readonly useCase: GetMemberUseCase) {}

  async handle(request: FastifyRequest<{ Params: { memberId: string } }>, reply: FastifyReply) {
    try {
      const member = await this.useCase.execute(request.params.memberId, request.user.id)
      return reply.send({ member: { name: member.name, relationship: member.relationship } })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar o membro' })
    }
  }
}
