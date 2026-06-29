import { describe, expect, it, vi } from 'vitest'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'
import { GetInvoicePaymentSummaryUseCase } from './get-invoice-payment-summary.use-case'

const makeRepo = (overrides: Partial<ICardsRepository> = {}): ICardsRepository =>
  ({
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    hasActiveInstallments: vi.fn(),
    findPurchases: vi.fn(),
    findTotalAmountUsed: vi.fn(),
    findMonthTotalAmount: vi.fn(),
    findInvoicePaymentSummary: vi.fn(),
    ...overrides,
  }) as ICardsRepository

const fakeCard = {
  id: 'card-1',
  ownerUserId: 'user-1',
  name: 'Neon',
  limit: 500000,
  dueDay: 10,
  closingOffsetDays: 7,
  createdAt: new Date(),
}

describe('GetInvoicePaymentSummaryUseCase', () => {
  it('throws CardNotFoundError when card does not belong to user', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) })
    const useCase = new GetInvoicePaymentSummaryUseCase(repo)

    await expect(useCase.execute('card-x', 'user-1', 5, 2026)).rejects.toThrow(CardNotFoundError)
  })

  it('returns invoiceTotal and empty members when no installments exist', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(fakeCard),
      findInvoicePaymentSummary: vi.fn().mockResolvedValue([]),
    })
    const useCase = new GetInvoicePaymentSummaryUseCase(repo)

    const result = await useCase.execute('card-1', 'user-1', 5, 2026)

    expect(result.invoiceTotal).toBe(0)
    expect(result.members).toHaveLength(0)
  })

  it('preserves isLate from repository for past periods', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(fakeCard),
      findInvoicePaymentSummary: vi.fn().mockResolvedValue([
        { id: 'm1', name: 'Kauan', relationship: 'Irmão', totalOwed: 10000, totalPaid: 4800, remaining: 5200, isLate: true },
        { id: 'm2', name: 'Maria', relationship: 'Mãe', totalOwed: 20000, totalPaid: 20000, remaining: 0, isLate: false },
      ]),
    })
    const useCase = new GetInvoicePaymentSummaryUseCase(repo)

    // month 4 (May) is past for dueDay=10 with today=2026-05-28
    const result = await useCase.execute('card-1', 'user-1', 4, 2026)

    expect(result.invoiceTotal).toBe(30000)
    expect(result.members).toHaveLength(2)
    expect(result.members[0].isLate).toBe(true)
    expect(result.members[1].isLate).toBe(false)
  })

  it('sets isLate to null for current period (no badge shown)', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(fakeCard),
      findInvoicePaymentSummary: vi.fn().mockResolvedValue([
        { id: 'm1', name: 'Kauan', relationship: 'Irmão', totalOwed: 10000, totalPaid: 4800, remaining: 5200, isLate: true },
      ]),
    })
    const useCase = new GetInvoicePaymentSummaryUseCase(repo)

    // month 5 (June) is current period for dueDay=10 with today=2026-05-28
    const result = await useCase.execute('card-1', 'user-1', 5, 2026)

    expect(result.members[0].isLate).toBeNull()
  })

  it('sets isLate to null for past period when member has no payment records', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(fakeCard),
      findInvoicePaymentSummary: vi.fn().mockResolvedValue([
        { id: 'm1', name: 'Kauan', relationship: 'Irmão', totalOwed: 10000, totalPaid: 0, remaining: 0, isLate: null },
      ]),
    })
    const useCase = new GetInvoicePaymentSummaryUseCase(repo)

    const result = await useCase.execute('card-1', 'user-1', 4, 2026)

    expect(result.members[0].isLate).toBeNull()
  })

  it('passes resolved targetMonth and targetYear to repository', async () => {
    const findSummary = vi.fn().mockResolvedValue([])
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(fakeCard),
      findInvoicePaymentSummary: findSummary,
    })
    const useCase = new GetInvoicePaymentSummaryUseCase(repo)

    await useCase.execute('card-1', 'user-1', 5, 2026)

    expect(findSummary).toHaveBeenCalledWith('card-1', 5, 2026)
  })
})
