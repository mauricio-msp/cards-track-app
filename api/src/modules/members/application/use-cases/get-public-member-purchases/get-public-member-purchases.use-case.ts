import { MemberNotFoundError } from '@/modules/members/domain/errors/members.errors'
import type {
  IMembersRepository,
  MemberPurchasesByCard,
} from '@/modules/members/domain/repositories/members.repository.interface'

export class GetPublicMemberPurchasesUseCase {
  constructor(private readonly repo: IMembersRepository) {}

  async execute(memberId: string, month?: number, year?: number): Promise<MemberPurchasesByCard[]> {
    const member = await this.repo.findByIdOnly(memberId)
    if (!member) throw new MemberNotFoundError()
    return this.repo.findPurchasesGroupedByCard(memberId, member.userId, month, year)
  }
}
