import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UpdateMemberInput } from '@/modules/members/members.dto'
import { MemberNotFoundError } from '@/modules/members/members.errors'
import type { UpdateMemberUseCase } from './update-member.use-case'

export class UpdateMemberController {
  constructor(private readonly useCase: UpdateMemberUseCase) {}

  async handle(
    request: FastifyRequest<{ Params: { memberId: string }; Body: UpdateMemberInput }>,
    reply: FastifyReply,
  ) {
    try {
      const member = await this.useCase.execute(request.params.memberId, request.user.id, request.body)
      return reply.send({ member, message: 'Membro atualizado com sucesso' })
    } catch (err) {
      if (err instanceof MemberNotFoundError) {
        return reply.status(404).send({ message: err.message })
      }
      request.log.error(err)
      return reply.status(500).send({ message: 'Falha ao atualizar o membro' })
    }
  }
}
