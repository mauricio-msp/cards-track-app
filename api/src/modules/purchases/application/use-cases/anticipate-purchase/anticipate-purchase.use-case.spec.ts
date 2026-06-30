import { describe, expect, it, vi } from 'vitest'
import {
  CardDoesNotSupportAnticipationError,
  InvalidAnticipateInstallmentError,
  NoUnpaidInstallmentsError,
  PurchaseNotFoundError,
} from '@/modules/purchases/domain/errors/purchases.errors'
import type { IPurchasesRepository } from '@/modules/purchases/domain/repositories/purchases.repository.interface'
import { AnticipatePurchaseUseCase } from './anticipate-purchase.use-case'

const makeRepo = (overrides: Partial<IPurchasesRepository> = {}): IPurchasesRepository =>
  ({
    findCardByOwner: vi.fn(),
    findActiveMembers: vi.fn(),
    getTotalUnpaid: vi.fn(),
    createPurchase: vi.fn(),
    findPurchaseMemberByIdAndOwner: vi.fn(),
    deletePurchase: vi.fn(),
    findPurchaseMemberByIdMemberAndOwner: vi.fn(),
    deletePurchaseMember: vi.fn(),
    findPurchaseMemberWithCard: vi.fn(),
    countPurchaseMembers: vi.fn(),
    findUnpaidFutureInstallments: vi.fn(),
    relocateInstallmentsToCurrentInvoice: vi.fn(),
    markPurchaseMemberAnticipated: vi.fn(),
    ...overrides,
  }) as IPurchasesRepository

// 10x purchase, member's cota. Current invoice already passed for p1.
const pm = {
  id: 'pm-1',
  purchaseId: 'p-1',
  cardId: 'card-1',
  memberId: 'm-1',
  installmentsCount: 10,
  installmentAmount: 10000,
  anticipatedAt: null,
  card: { dueDay: 10, closingOffsetDays: 7, anticipationMode: 'gap' as const },
}

// future unpaid installments p3..p10 (p2 is the current month, excluded by repo)
const futures = Array.from({ length: 8 }, (_, i) => ({ id: `i-${i + 3}`, number: i + 3 }))

describe('AnticipatePurchaseUseCase', () => {
  it('throws PurchaseNotFoundError when pm not found', async () => {
    const repo = makeRepo({ findPurchaseMemberWithCard: vi.fn().mockResolvedValue(null) })
    const useCase = new AnticipatePurchaseUseCase(repo)
    await expect(useCase.execute('x', 'u', { anticipateCount: 1 })).rejects.toThrow(
      PurchaseNotFoundError,
    )
  })

  it('throws when card mode is none', async () => {
    const repo = makeRepo({
      findPurchaseMemberWithCard: vi
        .fn()
        .mockResolvedValue({ ...pm, card: { ...pm.card, anticipationMode: 'none' } }),
      countPurchaseMembers: vi.fn().mockResolvedValue(1),
    })
    const useCase = new AnticipatePurchaseUseCase(repo)
    await expect(useCase.execute('pm-1', 'u', { anticipateCount: 1 })).rejects.toThrow(
      CardDoesNotSupportAnticipationError,
    )
  })

  it('gap mode selects the FIRST N future installments', async () => {
    const relocate = vi.fn().mockResolvedValue(undefined)
    const repo = makeRepo({
      findPurchaseMemberWithCard: vi.fn().mockResolvedValue(pm),
      countPurchaseMembers: vi.fn().mockResolvedValue(1),
      findUnpaidFutureInstallments: vi.fn().mockResolvedValue(futures),
      relocateInstallmentsToCurrentInvoice: relocate,
      markPurchaseMemberAnticipated: vi.fn(),
    })
    const useCase = new AnticipatePurchaseUseCase(repo)

    await useCase.execute('pm-1', 'u', { anticipateCount: 2 })

    expect(relocate).toHaveBeenCalledWith(
      expect.objectContaining({ installmentIds: ['i-3', 'i-4'], cardId: 'card-1' }),
    )
  })

  it('tail mode selects the LAST N future installments', async () => {
    const relocate = vi.fn().mockResolvedValue(undefined)
    const repo = makeRepo({
      findPurchaseMemberWithCard: vi
        .fn()
        .mockResolvedValue({ ...pm, card: { ...pm.card, anticipationMode: 'tail' } }),
      countPurchaseMembers: vi.fn().mockResolvedValue(1),
      findUnpaidFutureInstallments: vi.fn().mockResolvedValue(futures),
      relocateInstallmentsToCurrentInvoice: relocate,
      markPurchaseMemberAnticipated: vi.fn(),
    })
    const useCase = new AnticipatePurchaseUseCase(repo)

    await useCase.execute('pm-1', 'u', { anticipateCount: 2 })

    expect(relocate).toHaveBeenCalledWith(
      expect.objectContaining({ installmentIds: ['i-10', 'i-9'] }),
    )
  })

  it('throws NoUnpaidInstallmentsError when there are no future installments', async () => {
    const repo = makeRepo({
      findPurchaseMemberWithCard: vi.fn().mockResolvedValue(pm),
      countPurchaseMembers: vi.fn().mockResolvedValue(1),
      findUnpaidFutureInstallments: vi.fn().mockResolvedValue([]),
    })
    const useCase = new AnticipatePurchaseUseCase(repo)
    await expect(useCase.execute('pm-1', 'u', { anticipateCount: 1 })).rejects.toThrow(
      NoUnpaidInstallmentsError,
    )
  })

  it('throws InvalidAnticipateInstallmentError when N exceeds available', async () => {
    const repo = makeRepo({
      findPurchaseMemberWithCard: vi.fn().mockResolvedValue(pm),
      countPurchaseMembers: vi.fn().mockResolvedValue(1),
      findUnpaidFutureInstallments: vi
        .fn()
        .mockResolvedValue([{ id: 'i-9', number: 9 }, { id: 'i-10', number: 10 }]),
    })
    const useCase = new AnticipatePurchaseUseCase(repo)
    await expect(useCase.execute('pm-1', 'u', { anticipateCount: 5 })).rejects.toThrow(
      InvalidAnticipateInstallmentError,
    )
  })
})
