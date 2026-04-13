import { and, eq, isNull, sql } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { cards, debts, installments, invoices, members } from '@/db/schema'
import type { CreateMemberInput, Member, UpdateMemberInput } from '@/modules/members/members.dto'
import type {
  IMembersRepository,
  MemberDebtsByCard,
} from '@/modules/members/members.repository.interface'

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

  async findAll(
    userId: string,
  ): Promise<Pick<Member, 'id' | 'name' | 'relationship' | 'createdAt'>[]> {
    return this.db
      .select({
        id: members.id,
        name: members.name,
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
      .values({ userId, name: data.name.trim(), relationship: data.relationship })
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

  async findDebtsGroupedByCard(
    memberId: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<MemberDebtsByCard[]> {
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

    const rows = await this.db
      .select({
        card: { id: cards.id, name: cards.name, dueDay: cards.dueDay },
        debt: {
          id: debts.id,
          description: debts.description,
          purchaseDate: debts.purchaseDate,
          amount: debts.amount,
          installmentsCount: debts.installmentsCount,
          startInstallment: debts.startInstallment,
          endInstallment: debts.endInstallment,
          anticipatedAt: debts.anticipatedAt,
        },
        installment: { number: installments.number, amount: installments.amount },
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
      .innerJoin(
        installments,
        and(eq(installments.invoiceId, invoices.id), eq(installments.memberId, memberId)),
      )
      .innerJoin(debts, eq(installments.debtId, debts.id))
      .where(eq(cards.ownerUserId, userId))

    const cardMap = new Map<string, MemberDebtsByCard>()

    for (const row of rows) {
      const currentInstallment = row.installment.number
      const start = row.debt.startInstallment
      const end = row.debt.endInstallment ?? row.debt.installmentsCount

      if (currentInstallment < start || currentInstallment > end) continue

      if (!cardMap.has(row.card.id)) {
        cardMap.set(row.card.id, {
          card: {
            id: row.card.id,
            name: row.card.name,
            dueDay: row.card.dueDay,
            targetMonth: Number(row.targetMonth),
            targetYear: Number(row.targetYear),
          },
          debts: [],
        })
      }

      const cardEntry = cardMap.get(row.card.id)
      if (!cardEntry) continue

      const isAnticipated = !!row.debt.anticipatedAt
      const anticipatedCount = isAnticipated
        ? row.debt.installmentsCount - currentInstallment + 1
        : 0
      const remainingInstallments = isAnticipated
        ? Math.max(row.debt.installmentsCount - (currentInstallment + anticipatedCount - 1), 0)
        : Math.max(row.debt.installmentsCount - currentInstallment, 0)

      cardEntry.debts.push({
        id: row.debt.id,
        description: row.debt.description,
        purchaseDate: row.debt.purchaseDate,
        amount: row.debt.amount,
        installmentsCount: row.debt.installmentsCount,
        installmentsAmount: Number(row.installment.amount),
        elapsedInstallments: currentInstallment,
        remainingInstallments,
        anticipatedAt: row.debt.anticipatedAt?.toISOString() ?? null,
        anticipatedInstallmentsCount: isAnticipated ? anticipatedCount : null,
        anticipateFromInstallment: isAnticipated ? currentInstallment : null,
      })
    }

    return Array.from(cardMap.values())
  }
}
