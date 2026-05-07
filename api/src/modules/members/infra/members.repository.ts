import { and, eq, isNull, sql } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { cards, debts, installments, invoices, members } from '@/db/schema'
import type {
  IMembersRepository,
  MemberDebtsByCard,
} from '@/modules/members/domain/repositories/members.repository.interface'
import type {
  CreateMemberInput,
  Member,
  UpdateMemberInput,
} from '@/modules/members/http/dto/members.dto'

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
      .values({ userId, name: data.name.trim(), relationship: data.relationship, phone: data.phone ?? null })
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
          installmentsAmount: debts.installmentsAmount,
          startInstallment: debts.startInstallment,
          endInstallment: debts.endInstallment,
          anticipatedAt: debts.anticipatedAt,
          anticipateFromInstallment: debts.anticipateFromInstallment,
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
    const debtsByCard = new Map<string, Map<string, MemberDebtsByCard['debts'][number]>>()

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
        debtsByCard.set(row.card.id, new Map())
      }

      const cardEntry = cardMap.get(row.card.id)
      const debtMap = debtsByCard.get(row.card.id)
      if (!cardEntry || !debtMap) continue

      const isConsolidation =
        !!row.debt.anticipatedAt && currentInstallment === row.debt.anticipateFromInstallment
      const rawConsolidatedCount = isConsolidation && row.debt.installmentsAmount > 0
        ? Math.round(Number(row.installment.amount) / row.debt.installmentsAmount)
        : 0
      const anticipatedCount = Number.isFinite(rawConsolidatedCount) && rawConsolidatedCount > 0
        ? rawConsolidatedCount
        : isConsolidation ? row.debt.installmentsCount - currentInstallment + 1 : 0
      const remainingInstallments = isConsolidation
        ? Math.max(row.debt.installmentsCount - (currentInstallment + anticipatedCount - 1), 0)
        : Math.max(row.debt.installmentsCount - currentInstallment, 0)

      const existing = debtMap.get(row.debt.id)

      if (existing) {
        // Same debt has multiple installments in the target invoice (regular + consolidated).
        // The consolidation installment should take precedence for display; amounts accumulate.
        if (isConsolidation && !existing.anticipatedAt) {
          existing.anticipatedAt = row.debt.anticipatedAt?.toISOString() ?? null
          existing.anticipatedInstallmentsCount = anticipatedCount
          existing.anticipateFromInstallment = row.debt.anticipateFromInstallment
          existing.elapsedInstallments = currentInstallment
          existing.remainingInstallments = remainingInstallments
        }
        existing.installmentsAmount += Number(row.installment.amount)
        continue
      }

      const debtEntry: MemberDebtsByCard['debts'][number] = {
        id: row.debt.id,
        description: row.debt.description,
        purchaseDate: row.debt.purchaseDate,
        amount: row.debt.amount,
        installmentsCount: row.debt.installmentsCount,
        installmentsAmount: Number(row.installment.amount),
        elapsedInstallments: currentInstallment,
        remainingInstallments,
        anticipatedAt: isConsolidation ? (row.debt.anticipatedAt?.toISOString() ?? null) : null,
        anticipatedInstallmentsCount: isConsolidation ? anticipatedCount : null,
        anticipateFromInstallment: isConsolidation ? row.debt.anticipateFromInstallment : null,
      }

      debtMap.set(row.debt.id, debtEntry)
      cardEntry.debts.push(debtEntry)
    }

    return Array.from(cardMap.values())
  }
}
