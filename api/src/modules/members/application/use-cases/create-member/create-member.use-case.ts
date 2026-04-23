import { MemberAlreadyExistsError } from '@/modules/members/domain/errors/members.errors'
import type { IMembersRepository } from '@/modules/members/domain/repositories/members.repository.interface'
import type { CreateMemberInput, Member } from '@/modules/members/http/dto/members.dto'

export class CreateMemberUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(userId: string, data: CreateMemberInput): Promise<Member> {
    const existing = await this.repo.findByName(userId, data.name)
    if (existing) throw new MemberAlreadyExistsError()
    return this.repo.create(userId, data)
  }
}
