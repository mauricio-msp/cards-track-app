import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type { IMembersRepository } from '@/modules/members/domain/repositories/members.repository.interface'

export class GetPublicMemberUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(memberId: string) {
    const member = await this.repo.findByIdOnly(memberId)
    if (!member) throw new MemberNotFoundError()
    return {
      id: member.id,
      name: member.name,
      relationship: member.relationship,
      phone: member.phone,
    }
  }
}
