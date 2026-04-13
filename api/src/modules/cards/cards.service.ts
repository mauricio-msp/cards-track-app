import type { Card, CreateCardInput, UpdateCardInput } from '@/modules/cards/cards.dto'
import { CardHasActiveDebtsError, CardNotFoundError } from '@/modules/cards/cards.errors'
import type { CardDebt, ICardsRepository } from '@/modules/cards/cards.repository.interface'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export class CardsService {
  constructor(private readonly repo: ICardsRepository) {}

  async create(userId: string, data: CreateCardInput): Promise<Card> {
    return this.repo.create(userId, data)
  }

  async findAll(userId: string) {
    return this.repo.findAll(userId)
  }

  async findById(id: string, userId: string): Promise<Card> {
    const card = await this.repo.findById(id, userId)
    if (!card) throw new CardNotFoundError()
    return card
  }

  async update(id: string, userId: string, data: UpdateCardInput): Promise<void> {
    await this.findById(id, userId)
    return this.repo.update(id, data)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId)
    const hasDebts = await this.repo.hasActiveInstallments(id)
    if (hasDebts) throw new CardHasActiveDebtsError()
    return this.repo.delete(id)
  }

  async getCardDebts(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<CardDebt[]> {
    const card = await this.findById(id, userId)
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)
    return this.repo.findDebts(id, card, targetMonth, targetYear)
  }

  async getTotalAmountUsed(id: string, userId: string): Promise<number> {
    const card = await this.findById(id, userId)
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay)
    return this.repo.findTotalAmountUsed(id, targetMonth, targetYear)
  }

  async getMonthTotalAmount(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<{ total: number; targetMonth: number; targetYear: number }> {
    const card = await this.findById(id, userId)
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)
    const total = await this.repo.findMonthTotalAmount(id, targetMonth, targetYear)
    return { total, targetMonth, targetYear }
  }
}
