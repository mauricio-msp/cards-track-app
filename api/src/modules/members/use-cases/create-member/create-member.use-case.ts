import type { CreateMemberInput, Member } from '@/modules/members/members.dto'
import { MemberAlreadyExistsError } from '@/modules/members/members.errors'
import type { IMembersRepository } from '@/modules/members/members.repository.interface'

export class CreateMemberUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(userId: string, data: CreateMemberInput): Promise<Member> {
    const existing = await this.repo.findByName(userId, data.name)
    if (existing) throw new MemberAlreadyExistsError()
    return this.repo.create(userId, data)
  }
}
