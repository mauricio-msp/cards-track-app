import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type { IMembersRepository } from '@/modules/members/domain/repositories/members.repository.interface'

export class DeleteMemberUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const member = await this.repo.findById(id, userId)

    if (!member) throw new MemberNotFoundError()

    return this.repo.softDelete(id)
  }
}
