import { and, eq } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { cards, memberCoverages, members } from '@/db/schema'
import type {
  Coverage,
  CoverageWithMember,
  CreateCoverageData,
  ICoveragesRepository,
  UpdateCoverageRepaymentData,
} from '@/modules/coverages/domain/repositories/coverages.repository.interface'

export class CoveragesRepository implements ICoveragesRepository {
  constructor(private readonly db: typeof Db) {}

  async findByPeriod(
    memberId: string,
    cardId: string,
    targetMonth: number,
    targetYear: number,
  ): Promise<Coverage[]> {
    return this.db
      .select()
      .from(memberCoverages)
      .where(
        and(
          eq(memberCoverages.memberId, memberId),
          eq(memberCoverages.cardId, cardId),
          eq(memberCoverages.targetMonth, targetMonth),
          eq(memberCoverages.targetYear, targetYear),
        ),
      )
      .orderBy(memberCoverages.coveredAt)
  }

  async findAllByUser(
    userId: string,
    month?: number,
    year?: number,
  ): Promise<CoverageWithMember[]> {
    return this.db
      .select({
        id: memberCoverages.id,
        memberId: memberCoverages.memberId,
        memberName: members.name,
        cardId: memberCoverages.cardId,
        cardName: cards.name,
        targetMonth: memberCoverages.targetMonth,
        targetYear: memberCoverages.targetYear,
        amount: memberCoverages.amount,
        amountRepaid: memberCoverages.amountRepaid,
        settledAt: memberCoverages.settledAt,
      })
      .from(memberCoverages)
      .innerJoin(members, eq(memberCoverages.memberId, members.id))
      .innerJoin(cards, eq(memberCoverages.cardId, cards.id))
      .where(
        and(
          eq(members.userId, userId),
          eq(cards.ownerUserId, userId),
          month !== undefined ? eq(memberCoverages.targetMonth, month) : undefined,
          year !== undefined ? eq(memberCoverages.targetYear, year) : undefined,
        ),
      )
      .orderBy(memberCoverages.coveredAt)
  }

  async findById(id: string): Promise<Coverage | null> {
    const [row] = await this.db
      .select()
      .from(memberCoverages)
      .where(eq(memberCoverages.id, id))
      .limit(1)

    return row ?? null
  }

  async create(data: CreateCoverageData): Promise<Coverage> {
    const [row] = await this.db
      .insert(memberCoverages)
      .values({
        memberId: data.memberId,
        cardId: data.cardId,
        targetMonth: data.targetMonth,
        targetYear: data.targetYear,
        amount: data.amount,
        coveredAt: data.coveredAt,
        description: data.description ?? null,
      })
      .returning()

    return row
  }

  async updateRepayment(id: string, data: UpdateCoverageRepaymentData): Promise<Coverage> {
    const [row] = await this.db
      .update(memberCoverages)
      .set({
        amountRepaid: data.amountRepaid,
        settledAt: data.settledAt,
      })
      .where(eq(memberCoverages.id, id))
      .returning()

    return row
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(memberCoverages).where(eq(memberCoverages.id, id))
  }
}
