import { BrushCleaning, Funnel, X } from 'lucide-react'

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
import { useIsMobile } from '@/hooks/use-mobile'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

export function PurchasesFilter() {
  const {
    data: { years: yearsToFilter },
  } = usePurchasesYears()
  const isMobile = useIsMobile()
  const isDesktop = !isMobile

  const { month, year, activeCount, setMonth, setYear, clearMonth, clearYear, clearFilters } =
    usePurchasesFilter()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Funnel />
          {isDesktop && 'Filtros'}
          {activeCount > 0 && (
            <span className="size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-w-60">
        <PopoverHeader>
          <PopoverTitle>Filtrar despesas</PopoverTitle>
          <PopoverDescription>Filtre as despesas por mês e ano</PopoverDescription>
        </PopoverHeader>

        <div className="flex flex-col gap-4 mt-3">
          <div className="flex gap-1">
            <Select
              value={month !== undefined ? month.toString() : ''}
              onValueChange={value => setMonth(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um mês" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Meses</SelectLabel>
                  {MONTHS.map((m, index) => (
                    <SelectItem key={m.toLowerCase()} value={index.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {month !== undefined && (
              <Button size="icon" variant="ghost" onClick={clearMonth} className="shrink-0">
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-1">
            <Select
              value={year !== undefined ? year.toString() : ''}
              onValueChange={value => setYear(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um ano" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>Anos</SelectLabel>
                  {yearsToFilter.map(y => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {year !== undefined && (
              <Button size="icon" variant="ghost" onClick={clearYear} className="shrink-0">
                <X className="size-4" />
              </Button>
            )}
          </div>

          {activeCount > 0 && (
            <Button variant="ghost" onClick={clearFilters} className="self-start">
              <BrushCleaning />
              Limpar filtros
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
