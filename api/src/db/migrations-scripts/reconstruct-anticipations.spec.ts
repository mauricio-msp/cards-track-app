import { describe, expect, it } from 'vitest'
import { planReconstruction } from './reconstruct-anticipations'

describe('planReconstruction', () => {
  it('splits a lump of N installments into N natural rows preserving total', () => {
    // 10x, installmentAmount 10000, anticipated from F=3, lump amount = 30000 (N=3)
    // base period = month 4 (May) / 2026 -> p1=May, p2=Jun, p3=Jul, p4=Aug, p5=Sep
    const result = planReconstruction({
      installmentAmount: 10000,
      anticipateFromInstallment: 3,
      lumpAmount: 30000,
      lumpInvoiceId: 'inv-current',
      baseMonth: 4,
      baseYear: 2026,
    })

    expect(result.count).toBe(3)
    expect(result.rows).toEqual([
      { number: 3, amount: 10000, invoiceId: 'inv-current', naturalMonth: 6, naturalYear: 2026 },
      { number: 4, amount: 10000, invoiceId: 'inv-current', naturalMonth: 7, naturalYear: 2026 },
      { number: 5, amount: 10000, invoiceId: 'inv-current', naturalMonth: 8, naturalYear: 2026 },
    ])
    // total preserved
    expect(result.rows.reduce((s, r) => s + r.amount, 0)).toBe(30000)
  })

  it('handles N=1 (lump amount equals installmentAmount)', () => {
    const result = planReconstruction({
      installmentAmount: 10000,
      anticipateFromInstallment: 5,
      lumpAmount: 10000,
      lumpInvoiceId: 'inv-x',
      baseMonth: 0,
      baseYear: 2026,
    })
    expect(result.count).toBe(1)
    expect(result.rows[0]).toEqual({
      number: 5,
      amount: 10000,
      invoiceId: 'inv-x',
      naturalMonth: 4,
      naturalYear: 2026,
    })
  })
})
