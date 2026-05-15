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
import { MONTHS } from '@/helpers/months'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePurchasesFilter } from '@/hooks/use-purchases-filter'

function getStaticYears() {
  const current = new Date().getFullYear()
  return [current - 1, current, current + 1]
}

export function PublicPurchasesFilter() {
  const isMobile = useIsMobile()
  const { month, year, setFilters, clearFilters } = usePurchasesFilter()
  const years = getStaticYears()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          {!isMobile && 'Filtros'}
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
                {MONTHS.map((m, index) => (
                  <SelectItem key={m.toLowerCase()} value={index.toString()}>
                    {m}
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
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
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
