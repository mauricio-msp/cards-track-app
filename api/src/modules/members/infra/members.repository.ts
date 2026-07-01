import { and, eq, isNull, sql } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { cards, installments, invoices, members, purchaseMembers, purchases } from '@/db/schema'
import type {
  IMembersRepository,
  MemberPurchase,
  MemberPurchasesByCard,
} from '@/modules/members/domain/repositories/members.repository.interface'
import type {
  CreateMemberInput,
  Member,
  UpdateMemberInput,
} from '@/modules/members/http/dto/members.dto'

type GroupedPurchaseRow = {
  card: { id: string; name: string; dueDay: number }
  pm: {
    id: string
    amount: number
    installmentAmount: number
    startInstallment: number
    endInstallment: number | null
    anticipatedAt: Date | null
    anticipateFromInstallment: number | null
  }
  purchase: { description: string; purchaseDate: string; installmentsCount: number }
  installment: { number: number; amount: unknown; anticipatedAt: Date | null; paidAt: Date | null }
  targetMonth: unknown
  targetYear: unknown
}

export class MembersRepository implements IMembersRepository {
  constructor(private readonly db: typeof Db) {}

  async findById(id: string, userId: string): Promise<Member | null> {
    const [member] = await this.db
      .select()
      .from(members)
      .where(and(eq(members.id, id), eq(members.userId, userId), isNull(members.deletedAt)))
      .limit(1)

    return member ?? null
  }

  async findByIdOnly(id: string): Promise<Member | null> {
    const [member] = await this.db
      .select()
      .from(members)
      .where(and(eq(members.id, id), isNull(members.deletedAt)))
      .limit(1)

    return member ?? null
  }

  async findAll(
    userId: string,
  ): Promise<Pick<Member, 'id' | 'name' | 'phone' | 'relationship' | 'createdAt'>[]> {
    return this.db
      .select({
        id: members.id,
        name: members.name,
        phone: members.phone,
        relationship: members.relationship,
        createdAt: members.createdAt,
      })
      .from(members)
      .where(and(eq(members.userId, userId), isNull(members.deletedAt)))
  }

  async findByName(userId: string, name: string): Promise<{ id: string } | null> {
    const [member] = await this.db
      .select({ id: members.id })
      .from(members)
      .where(and(eq(members.userId, userId), sql`lower(${members.name}) = lower(${name})`))
      .limit(1)

    return member ?? null
  }

  async create(userId: string, data: CreateMemberInput): Promise<Member> {
    const [member] = await this.db
      .insert(members)
      .values({
        userId,
        name: data.name.trim(),
        relationship: data.relationship,
        phone: data.phone ?? null,
      })
      .returning()

    return member
  }

  async update(id: string, data: UpdateMemberInput): Promise<Member> {
    const updates: Partial<typeof members.$inferInsert> = {}

    if (data.phone !== undefined) updates.phone = data.phone
    if (data.relationship !== undefined) updates.relationship = data.relationship

    const [updated] = await this.db
      .update(members)
      .set(updates)
      .where(eq(members.id, id))
      .returning()

    return updated
  }

  async softDelete(id: string): Promise<void> {
    await this.db.update(members).set({ deletedAt: new Date() }).where(eq(members.id, id))
  }

  async findPurchasesGroupedByCard(
    memberId: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<MemberPurchasesByCard[]> {
    const { targetMonthExpr, targetYearExpr } = this.buildTargetPeriodExprs(month, year)

    const rows = await this.db
      .select({
        card: { id: cards.id, name: cards.name, dueDay: cards.dueDay },
        pm: {
          id: purchaseMembers.id,
          amount: purchaseMembers.amount,
          installmentAmount: purchaseMembers.installmentAmount,
          startInstallment: purchaseMembers.startInstallment,
          endInstallment: purchaseMembers.endInstallment,
          anticipatedAt: purchaseMembers.anticipatedAt,
          anticipateFromInstallment: purchaseMembers.anticipateFromInstallment,
        },
        purchase: {
          description: purchases.description,
          purchaseDate: purchases.purchaseDate,
          installmentsCount: purchases.installmentsCount,
        },
        installment: {
          number: installments.number,
          amount: installments.amount,
          anticipatedAt: installments.anticipatedAt,
          paidAt: installments.paidAt,
        },
        targetMonth: targetMonthExpr,
        targetYear: targetYearExpr,
      })
      .from(cards)
      .innerJoin(
        invoices,
        and(
          eq(invoices.cardId, cards.id),
          eq(invoices.month, targetMonthExpr),
          eq(invoices.year, targetYearExpr),
        ),
      )
      .innerJoin(installments, eq(installments.invoiceId, invoices.id))
      .innerJoin(
        purchaseMembers,
        and(
          eq(installments.purchaseMemberId, purchaseMembers.id),
          eq(purchaseMembers.memberId, memberId),
          sql`${installments.number} >= ${purchaseMembers.startInstallment}`,
        ),
      )
      .innerJoin(
        purchases,
        and(
          eq(purchaseMembers.purchaseId, purchases.id),
          sql`${installments.number} <= COALESCE(${purchaseMembers.endInstallment}, ${purchases.installmentsCount})`,
        ),
      )
      .where(eq(cards.ownerUserId, userId))

    return this.mapGroupedRows(rows)
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private buildTargetPeriodExprs(month?: number, year?: number) {
    const now = new Date()
    const today = now.getDate()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const todaySQL = sql<number>`${today}::int`
    const currentMonthSQL = sql<number>`${currentMonth}::int`
    const currentYearSQL = sql<number>`${currentYear}::int`
    const nextYearSQL = sql<number>`${currentYear + 1}::int`

    const targetMonthExpr =
      month !== undefined
        ? sql<number>`${month}::int`
        : sql<number>`
            CASE
              WHEN ${todaySQL} > ${cards.dueDay}
                THEN (${currentMonthSQL} + 1) % 12
              ELSE ${currentMonthSQL}
            END
          `

    const targetYearExpr =
      year !== undefined
        ? sql<number>`${year}::int`
        : sql<number>`
            CASE
              WHEN ${todaySQL} > ${cards.dueDay} AND ${currentMonthSQL} = 11
                THEN ${nextYearSQL}
              ELSE ${currentYearSQL}
            END
          `

    return { targetMonthExpr, targetYearExpr }
  }

  private mapGroupedRows(rows: GroupedPurchaseRow[]): MemberPurchasesByCard[] {
    const cardMap = new Map<string, MemberPurchasesByCard>()
    const pmByCard = new Map<string, Map<string, MemberPurchase>>()
    const pmNumbers = new Map<string, { minAll: number; minNonAnticipated: number | null }>()

    for (const row of rows) {
      const currentInstallment = row.installment.number
      const amount = Number(row.installment.amount)

      if (!cardMap.has(row.card.id)) {
        cardMap.set(row.card.id, {
          card: {
            id: row.card.id,
            name: row.card.name,
            dueDay: row.card.dueDay,
            targetMonth: Number(row.targetMonth),
            targetYear: Number(row.targetYear),
          },
          purchases: [],
        })
        pmByCard.set(row.card.id, new Map())
      }

      // biome-ignore lint/style/noNonNullAssertion: set above
      const cardEntry = cardMap.get(row.card.id)!
      // biome-ignore lint/style/noNonNullAssertion: set above
      const pmMap = pmByCard.get(row.card.id)!

      const isAnticipatedRow = row.installment.anticipatedAt != null

      const existing = pmMap.get(row.pm.id)

      let numbers = pmNumbers.get(row.pm.id)
      if (!numbers) {
        numbers = { minAll: currentInstallment, minNonAnticipated: null }
        pmNumbers.set(row.pm.id, numbers)
      }
      if (currentInstallment < numbers.minAll) numbers.minAll = currentInstallment
      if (!isAnticipatedRow) {
        if (numbers.minNonAnticipated === null || currentInstallment < numbers.minNonAnticipated) {
          numbers.minNonAnticipated = currentInstallment
        }
      }

      if (existing) {
        existing.installmentsAmount += amount

        if (isAnticipatedRow) {
          existing.anticipatedInstallmentsCount = (existing.anticipatedInstallmentsCount ?? 0) + 1
          // biome-ignore lint/style/noNonNullAssertion: guarded by isAnticipatedRow
          const iso = row.installment.anticipatedAt!.toISOString()
          if (!existing.anticipatedAt || iso > existing.anticipatedAt) existing.anticipatedAt = iso
          if (
            existing.anticipateFromInstallment === null ||
            currentInstallment < existing.anticipateFromInstallment
          ) {
            existing.anticipateFromInstallment = currentInstallment
          }
        }

        continue
      }

      const entry: MemberPurchase = {
        id: row.pm.id,
        description: row.purchase.description,
        purchaseDate: row.purchase.purchaseDate,
        amount: row.pm.amount,
        installmentsCount: row.purchase.installmentsCount,
        installmentsAmount: amount,
        elapsedInstallments: currentInstallment,
        remainingInstallments: 0,
        anticipatedAt: null,
        anticipatedInstallmentsCount: 0,
        anticipateFromInstallment: null,
      }

      if (isAnticipatedRow) {
        entry.anticipatedInstallmentsCount = (entry.anticipatedInstallmentsCount ?? 0) + 1
        // biome-ignore lint/style/noNonNullAssertion: guarded by isAnticipatedRow
        entry.anticipatedAt = row.installment.anticipatedAt!.toISOString()
        entry.anticipateFromInstallment = currentInstallment
      }

      pmMap.set(row.pm.id, entry)
      cardEntry.purchases.push(entry)
    }

    for (const pmMap of pmByCard.values()) {
      for (const entry of pmMap.values()) {
        // biome-ignore lint/style/noNonNullAssertion: populated for every pm processed above
        const numbers = pmNumbers.get(entry.id)!
        entry.elapsedInstallments = numbers.minNonAnticipated ?? numbers.minAll
        entry.remainingInstallments = Math.max(entry.installmentsCount - entry.elapsedInstallments, 0)
      }
    }

    return Array.from(cardMap.values())
  }
}
