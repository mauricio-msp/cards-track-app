import type { IMembersRepository } from '@/modules/members/members.repository.interface'

export class GetMembersUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(userId: string) {
    return this.repo.findAll(userId)
  }
}
