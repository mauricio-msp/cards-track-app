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
import { useDebtsYears } from '@/features/dashboard/hooks'
import { MONTHS } from '@/helpers/months'
import { useDebtsFilter } from '@/hooks/store/use-debts-filter-store'

export function DebtsFilter() {
  const {
    data: { years: yearsToFilter },
  } = useDebtsYears()
  const { month, year, setFilters, clearFilters } = useDebtsFilter()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          Filtros
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
            <SelectContent>
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
            <SelectContent>
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
