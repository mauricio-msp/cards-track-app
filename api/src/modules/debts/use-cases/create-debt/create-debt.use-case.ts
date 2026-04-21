import { uuidv7 } from 'uuidv7'
import type { CreateDebtInput } from '@/modules/debts/debts.dto'
import type { IDebtsRepository } from '@/modules/debts/debts.repository.interface'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'
import { resolveTargetPeriod } from '@/utils/resolve-target-period'

export class CreateDebtUseCase {
  constructor(private readonly repo: IDebtsRepository) {}

  async execute(userId: string, data: CreateDebtInput) {
    const card = await this.repo.findCardByOwner(data.cardId, userId)
    if (!card) throw new Error('Cartão não encontrado ou não pertence ao usuário')

    const memberIds = data.members.map(m => m.id)
    const activeMembers = await this.repo.findActiveMembers(memberIds)
    if (activeMembers.length !== memberIds.length) {
      throw new Error('Um ou mais membros foram excluídos e não podem ter novas despesas')
    }

    const newPurchaseTotal = data.members.reduce((sum, m) => sum + m.amount, 0)
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay)
    const totalUnpaid = await this.repo.getTotalUnpaid(data.cardId, targetMonth, targetYear)

    if (totalUnpaid + newPurchaseTotal > card.limit) {
      const available = card.limit - totalUnpaid
      throw new Error(
        `Limite insuficiente. Disponível: R$${(available / 100).toFixed(2)}, necessário: R$${(newPurchaseTotal / 100).toFixed(2)}`,
      )
    }

    const [datePart] = data.purchaseDate.split('T')
    const purchaseDateResetHours = new Date(`${datePart}T00:00:00`)
    const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
      purchaseDateResetHours,
      card.dueDay,
      card.closingOffsetDays,
    )
    const groupId = uuidv7()

    return this.repo.createDebtTransaction(
      data,
      card,
      groupId,
      invoiceMonth,
      invoiceYear,
      purchaseDateResetHours,
      userId,
    )
  }
}
