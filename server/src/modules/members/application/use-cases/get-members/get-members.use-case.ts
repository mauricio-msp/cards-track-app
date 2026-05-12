import type { IMembersRepository } from '@/modules/members/domain/repositories/members.repository.interface'
import type { Member } from '@/modules/members/http/dto/members.dto'

export class GetMembersUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(
    userId: string,
  ): Promise<Pick<Member, 'id' | 'name' | 'relationship' | 'phone' | 'createdAt'>[]> {
    return this.repo.findAll(userId)
  }
}
