import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type {
  IMembersRepository,
  MemberDebtsByCard,
} from '@/modules/members/domain/repositories/members.repository.interface'

export class GetMemberDebtsUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<MemberDebtsByCard[]> {
    const member = await this.repo.findById(id, userId)
    if (!member) throw new MemberNotFoundError()
    return this.repo.findDebtsGroupedByCard(id, userId, month, year)
  }
}
