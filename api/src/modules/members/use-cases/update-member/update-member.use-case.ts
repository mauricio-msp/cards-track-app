import type { Member, UpdateMemberInput } from '@/modules/members/members.dto'
import { MemberNotFoundError } from '@/modules/members/members.errors'
import type { IMembersRepository } from '@/modules/members/members.repository.interface'

export class UpdateMemberUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(id: string, userId: string, data: UpdateMemberInput): Promise<Member> {
    const member = await this.repo.findById(id, userId)
    if (!member) throw new MemberNotFoundError()
    return this.repo.update(id, data)
  }
}
