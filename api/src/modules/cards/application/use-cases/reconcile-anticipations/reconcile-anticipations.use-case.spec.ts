import { describe, expect, it, vi } from 'vitest'
import { CardNotFoundError } from '@/modules/cards/domain/errors/cards.errors'
import type { ICardsRepository } from '@/modules/cards/domain/repositories/cards.repository.interface'
import { ReconcileAnticipationsUseCase } from './reconcile-anticipations.use-case'

const baseRepo = (overrides: Partial<ICardsRepository> = {}): ICardsRepository =>
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
    findAnticipatedPurchaseMembers: vi.fn(),
    getAnticipationAnchors: vi.fn(),
    revertAnticipationInInvoice: vi.fn(),
    countAnticipatedInstallments: vi.fn(),
    setPurchaseMemberAnticipation: vi.fn(),
    reapplyAnticipation: vi.fn(),
    ...overrides,
  }) as ICardsRepository

const card = (mode: 'none' | 'gap' | 'tail') => ({
  id: 'card-1',
  ownerUserId: 'u',
  name: 'Nubank',
  limit: 100000,
  dueDay: 10,
  closingOffsetDays: 7,
  anticipationMode: mode,
  createdAt: new Date(),
})

describe('ReconcileAnticipationsUseCase', () => {
  it('throws when card not owned', async () => {
    const repo = baseRepo({ findById: vi.fn().mockResolvedValue(null) })
    await expect(new ReconcileAnticipationsUseCase(repo).execute('card-1', 'u')).rejects.toThrow(
      CardNotFoundError,
    )
  })

  it('tail card: reverts then reapplies each anticipated pm at its anchor', async () => {
    const revert = vi.fn().mockResolvedValue(2)
    const reapply = vi.fn().mockResolvedValue(2)
    const setAnticipation = vi.fn()
    const repo = baseRepo({
      findById: vi.fn().mockResolvedValue(card('tail')),
      findAnticipatedPurchaseMembers: vi.fn().mockResolvedValue([{ id: 'pm-1' }]),
      getAnticipationAnchors: vi.fn().mockResolvedValue([{ month: 5, year: 2026, count: 2 }]),
      revertAnticipationInInvoice: revert,
      reapplyAnticipation: reapply,
      countAnticipatedInstallments: vi.fn().mockResolvedValue(2),
      setPurchaseMemberAnticipation: setAnticipation,
    })

    const result = await new ReconcileAnticipationsUseCase(repo).execute('card-1', 'u')

    expect(revert).toHaveBeenCalledWith('pm-1', 5, 2026)
    expect(reapply).toHaveBeenCalledWith(
      expect.objectContaining({ pmId: 'pm-1', mode: 'tail', count: 2, anchorMonth: 5, anchorYear: 2026 }),
    )
    expect(setAnticipation).toHaveBeenCalledWith('pm-1', expect.any(Date))
    expect(result.cotasAfetadas).toBe(1)
    expect(result.parcelasMovidas).toBe(2)
  })

  it('none card: reverts and does NOT reapply', async () => {
    const revert = vi.fn().mockResolvedValue(3)
    const reapply = vi.fn()
    const setAnticipation = vi.fn()
    const repo = baseRepo({
      findById: vi.fn().mockResolvedValue(card('none')),
      findAnticipatedPurchaseMembers: vi.fn().mockResolvedValue([{ id: 'pm-1' }]),
      getAnticipationAnchors: vi.fn().mockResolvedValue([{ month: 5, year: 2026, count: 3 }]),
      revertAnticipationInInvoice: revert,
      reapplyAnticipation: reapply,
      setPurchaseMemberAnticipation: setAnticipation,
    })

    const result = await new ReconcileAnticipationsUseCase(repo).execute('card-1', 'u')

    expect(revert).toHaveBeenCalledWith('pm-1', 5, 2026)
    expect(reapply).not.toHaveBeenCalled()
    expect(setAnticipation).toHaveBeenCalledWith('pm-1', null)
    expect(result.cotasAfetadas).toBe(1)
  })

  it('pm with TWO anchors: reverts and reapplies both, summing parcelasMovidas', async () => {
    const revert = vi.fn().mockResolvedValue(1)
    const reapply = vi
      .fn()
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3)
    const setAnticipation = vi.fn()
    const repo = baseRepo({
      findById: vi.fn().mockResolvedValue(card('gap')),
      findAnticipatedPurchaseMembers: vi.fn().mockResolvedValue([{ id: 'pm-1' }]),
      getAnticipationAnchors: vi.fn().mockResolvedValue([
        { month: 5, year: 2026, count: 2 },
        { month: 7, year: 2026, count: 3 },
      ]),
      revertAnticipationInInvoice: revert,
      reapplyAnticipation: reapply,
      countAnticipatedInstallments: vi.fn().mockResolvedValue(5),
      setPurchaseMemberAnticipation: setAnticipation,
    })

    const result = await new ReconcileAnticipationsUseCase(repo).execute('card-1', 'u')

    expect(revert).toHaveBeenCalledTimes(2)
    expect(revert).toHaveBeenNthCalledWith(1, 'pm-1', 5, 2026)
    expect(revert).toHaveBeenNthCalledWith(2, 'pm-1', 7, 2026)

    expect(reapply).toHaveBeenCalledTimes(2)
    expect(reapply).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ pmId: 'pm-1', mode: 'gap', count: 2, anchorMonth: 5, anchorYear: 2026 }),
    )
    expect(reapply).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ pmId: 'pm-1', mode: 'gap', count: 3, anchorMonth: 7, anchorYear: 2026 }),
    )

    expect(result.cotasAfetadas).toBe(1)
    expect(result.parcelasMovidas).toBe(5)
    expect(result.valorRealocado).toBe(5)
    expect(setAnticipation).toHaveBeenCalledWith('pm-1', expect.any(Date))
  })
})
