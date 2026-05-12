import { BrushCleaning, ListFilter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePurchasesYears } from '@/features/dashboard/hooks'
import { MONTHS } from '@/helpers/months'
import { usePurchasesFilter } from '@/hooks/store/use-purchases-filter-store'
import { useIsMobile } from '@/hooks/use-mobile'

export function PurchasesFilter() {
  const {
    data: { years: yearsToFilter },
  } = usePurchasesYears()
  const isMobile = useIsMobile()
  const isDesktop = !isMobile

  const { month, year, setFilters, clearFilters } = usePurchasesFilter()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          {isDesktop && 'Filtros'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-w-60">
        <PopoverHeader>
          <PopoverTitle>Filtrar despesas</PopoverTitle>
          <PopoverDescription>Filtre as despesas por mês e ano</PopoverDescription>
        </PopoverHeader>

        <div className="flex flex-col gap-4 mt-3">
          <Select
            value={month?.toString()}
            onValueChange={value => setFilters({ month: Number(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um mês" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Meses</SelectLabel>
                {MONTHS.map((month, index) => (
                  <SelectItem key={month.toLowerCase()} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={year?.toString()}
            onValueChange={value => setFilters({ year: Number(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um ano" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Anos</SelectLabel>
                {yearsToFilter.map(year => {
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={clearFilters} className="self-start">
            <BrushCleaning />
            Limpar filtros
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
