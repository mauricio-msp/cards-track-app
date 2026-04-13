import { and, eq, isNotNull } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { cards, installments, invoices } from '@/db/schema'
import type { IInstallmentsRepository } from '@/modules/installments/installments.repository.interface'

export class InstallmentsRepository implements IInstallmentsRepository {
  constructor(private readonly db: typeof Db) {}

  async findByIdAndOwner(installmentId: string, userId: string): Promise<{ id: string } | null> {
    const [row] = await this.db
      .select({ id: installments.id })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(cards, and(eq(invoices.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(eq(installments.id, installmentId))
      .limit(1)

    return row ?? null
  }

  async findPaidByIdAndOwner(
    installmentId: string,
    userId: string,
  ): Promise<{ id: string } | null> {
    const [row] = await this.db
      .select({ id: installments.id })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(cards, and(eq(invoices.cardId, cards.id), eq(cards.ownerUserId, userId)))
      .where(and(eq(installments.id, installmentId), isNotNull(installments.paidAt)))
      .limit(1)

    return row ?? null
  }

  async markAsPaid(installmentId: string): Promise<Date> {
    const paidAt = new Date()
    await this.db.update(installments).set({ paidAt }).where(eq(installments.id, installmentId))
    return paidAt
  }

  async markAsUnpaid(installmentId: string): Promise<void> {
    await this.db
      .update(installments)
      .set({ paidAt: null })
      .where(eq(installments.id, installmentId))
  }
}
