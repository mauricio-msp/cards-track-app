import type { CreateMemberInput, Member, UpdateMemberInput } from '@/modules/members/members.dto'
import { MemberAlreadyExistsError, MemberNotFoundError } from '@/modules/members/members.errors'
import type { IMembersRepository, MemberDebtsByCard } from '@/modules/members/members.repository.interface'

export class MembersService {
  constructor(private readonly repo: IMembersRepository) {}

  async create(userId: string, data: CreateMemberInput): Promise<Member> {
    const existing = await this.repo.findByName(userId, data.name)
    if (existing) throw new MemberAlreadyExistsError()
    return this.repo.create(userId, data)
  }

  async findAll(userId: string) {
    return this.repo.findAll(userId)
  }

  async findById(id: string, userId: string): Promise<Member> {
    const member = await this.repo.findById(id, userId)
    if (!member) throw new MemberNotFoundError()
    return member
  }

  async update(id: string, userId: string, data: UpdateMemberInput): Promise<Member> {
    await this.findById(id, userId)
    return this.repo.update(id, data)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId)
    return this.repo.softDelete(id)
  }

  async getMemberDebts(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<MemberDebtsByCard[]> {
    await this.findById(id, userId)
    return this.repo.findDebtsGroupedByCard(id, userId, month, year)
  }
}
