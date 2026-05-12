import { create } from 'zustand'

interface FilterPurchases {
  month?: number
  year?: number
  setFilters: (filters: { month?: number; year?: number }) => void
  clearFilters: () => void
}

export const usePurchasesFilter = create<FilterPurchases>(set => ({
  month: undefined,
  year: undefined,
  setFilters: ({ month, year }) =>
    set(state => ({
      month: month ?? state.month,
      year: year ?? state.year,
    })),
  clearFilters: () => set({ month: undefined, year: undefined }),
}))
