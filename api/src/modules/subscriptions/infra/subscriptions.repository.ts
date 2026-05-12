import { and, eq, isNull } from 'drizzle-orm'
import type { db as Db } from '@/db'
import { cards, members, subscriptions } from '@/db/schema'
import type { CreateSubscriptionInput, UpdateSubscriptionInput } from '@/modules/subscriptions/http/dto/subscriptions.dto'
import type {
  ISubscriptionsRepository,
  Subscription,
  SubscriptionRow,
} from '@/modules/subscriptions/domain/repositories/subscriptions.repository.interface'

export class SubscriptionsRepository implements ISubscriptionsRepository {
  constructor(private readonly db: typeof Db) {}

  async findCardByOwner(cardId: string, userId: string): Promise<{ id: string } | null> {
    const [card] = await this.db
      .select({ id: cards.id })
      .from(cards)
      .where(and(eq(cards.id, cardId), eq(cards.ownerUserId, userId)))
      .limit(1)
    return card ?? null
  }

  async findActiveMemberById(memberId: string): Promise<{ id: string } | null> {
    const [member] = await this.db
      .select({ id: members.id })
      .from(members)
      .where(and(eq(members.id, memberId), isNull(members.deletedAt)))
      .limit(1)
    return member ?? null
  }

  async findById(id: string, userId: string): Promise<{ id: string } | null> {
    const [sub] = await this.db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(and(eq(subscriptions.id, id), eq(subscriptions.userId, userId)))
      .limit(1)
    return sub ?? null
  }

  async findAll(userId: string): Promise<SubscriptionRow[]> {
    const rows = await this.db
      .select({
        id: subscriptions.id,
        name: subscriptions.name,
        amount: subscriptions.amount,
        billingDay: subscriptions.billingDay,
        active: subscriptions.active,
        cardId: subscriptions.cardId,
        cardName: cards.name,
        memberId: subscriptions.memberId,
        memberName: members.name,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .innerJoin(cards, eq(subscriptions.cardId, cards.id))
      .innerJoin(members, eq(subscriptions.memberId, members.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(subscriptions.createdAt)

    return rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))
  }

  async create(data: CreateSubscriptionInput & { userId: string }): Promise<Subscription> {
    const [created] = await this.db
      .insert(subscriptions)
      .values({
        userId: data.userId,
        cardId: data.cardId,
        memberId: data.memberId,
        name: data.name,
        amount: data.amount,
        billingDay: data.billingDay,
      })
      .returning()
    return { ...created, createdAt: created.createdAt.toISOString() }
  }

  async update(id: string, data: UpdateSubscriptionInput): Promise<void> {
    await this.db.update(subscriptions).set(data).where(eq(subscriptions.id, id))
  }

  async deactivate(id: string): Promise<void> {
    await this.db
      .update(subscriptions)
      .set({ active: false, deletedAt: new Date() })
      .where(eq(subscriptions.id, id))
  }
}
