import { ListFilter } from 'lucide-react'
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
import { useFilterDebts } from '@/hooks/store/use-filter-debts-store'

const yearsToFilter = Array.from({ length: 4 }).map((_, index) => {
  const year = new Date().getFullYear() + 1 - index

  return year
})

export function FilterDebts() {
  const { month, year, setFilters, clearFilters } = useFilterDebts()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <ListFilter />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-w-60">
        <PopoverHeader>
          <PopoverTitle>Filter debs</PopoverTitle>
          <PopoverDescription>Filter debts by month and year</PopoverDescription>
        </PopoverHeader>

        <div className="flex flex-col gap-4 mt-3">
          <Select
            value={month?.toString()}
            onValueChange={value => setFilters({ month: Number(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a month" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Months</SelectLabel>
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
              <SelectValue placeholder="Select a year" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Years</SelectLabel>
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
            Clear filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
