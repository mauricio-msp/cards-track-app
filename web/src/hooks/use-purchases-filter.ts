import { parseAsInteger, useQueryStates } from 'nuqs'

export function usePurchasesFilter() {
  const [{ month, year }, setFilters] = useQueryStates({
    month: parseAsInteger,
    year: parseAsInteger,
  })

  const activeCount = (month !== null ? 1 : 0) + (year !== null ? 1 : 0)

  return {
    month: month ?? undefined,
    year: year ?? undefined,
    activeCount,
    setMonth: (value: number) => setFilters({ month: value }),
    setYear: (value: number) => setFilters({ year: value }),
    clearMonth: () => setFilters({ month: null }),
    clearYear: () => setFilters({ year: null }),
    clearFilters: () => setFilters({ month: null, year: null }),
  }
}
