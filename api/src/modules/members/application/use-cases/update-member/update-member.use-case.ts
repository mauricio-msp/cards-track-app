import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type { IMembersRepository } from '@/modules/members/domain/repositories/members.repository.interface'
import type { Member, UpdateMemberInput } from '@/modules/members/http/dto/members.dto'

export class UpdateMemberUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(id: string, userId: string, data: UpdateMemberInput): Promise<Member> {
    const member = await this.repo.findById(id, userId)
    if (!member) throw new MemberNotFoundError()
    return this.repo.update(id, data)
  }
}
