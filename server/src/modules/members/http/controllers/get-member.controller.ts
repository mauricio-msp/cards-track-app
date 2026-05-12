import type { FastifyReply, FastifyRequest } from 'fastify'
import type { GetMemberUseCase } from '@/modules/members/application/use-cases/get-member/get-member.use-case'
import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'

export class GetMemberController {
  constructor(private readonly useCase: GetMemberUseCase) {}

  async handle(request: FastifyRequest<{ Params: { memberId: string } }>, reply: FastifyReply) {
    try {
      const member = await this.useCase.execute(request.params.memberId, request.user.id)
      return reply.send({
        member: {
          id: member.id,
          name: member.name,
          relationship: member.relationship,
          phone: member.phone,
        },
      })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao buscar o membro' })
    }
  }
}
