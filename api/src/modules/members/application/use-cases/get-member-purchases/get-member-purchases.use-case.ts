import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type {
  IMembersRepository,
  MemberPurchasesByCard,
} from '@/modules/members/domain/repositories/members.repository.interface'

export class GetMemberPurchasesUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<MemberPurchasesByCard[]> {
    const member = await this.repo.findById(id, userId)
    if (!member) throw new MemberNotFoundError()
    return this.repo.findPurchasesGroupedByCard(id, userId, month, year)
  }
}
