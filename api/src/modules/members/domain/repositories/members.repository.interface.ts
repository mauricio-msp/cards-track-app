import type {
  CreateMemberInput,
  Member,
  UpdateMemberInput,
} from '@/modules/members/http/dto/members.dto'

export type MemberDebtsByCard = {
  card: {
    id: string
    name: string
    dueDay: number
    targetYear: number
    targetMonth: number
  }
  debts: {
    id: string
    description: string
    purchaseDate: string
    amount: number
    installmentsCount: number
    installmentsAmount: number
    elapsedInstallments: number
    remainingInstallments: number
    anticipatedAt: string | null
    anticipatedInstallmentsCount: number | null
    anticipateFromInstallment: number | null
  }[]
}

export interface IMembersRepository {
  findById(id: string, userId: string): Promise<Member | null>
  findAll(
    userId: string,
  ): Promise<Pick<Member, 'id' | 'name' | 'relationship' | 'phone' | 'createdAt'>[]>
  findByName(userId: string, name: string): Promise<{ id: string } | null>
  create(userId: string, data: CreateMemberInput): Promise<Member>
  update(id: string, data: UpdateMemberInput): Promise<Member>
  softDelete(id: string): Promise<void>
  findDebtsGroupedByCard(
    memberId: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<MemberDebtsByCard[]>
}
