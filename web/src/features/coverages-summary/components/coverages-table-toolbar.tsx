import type { Table } from '@tanstack/react-table'
import { Check, Columns3, Search, X } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import type { AllCoverageItem } from '@/features/coverages-summary/api/get-all-coverages'
import { cn } from '@/lib/utils'

type StatusFilter = 'settled' | 'pending'

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Pago', value: 'settled' },
  { label: 'Pendente', value: 'pending' },
]

type TableFilterProps = {
  table: Table<AllCoverageItem>
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1 bg-secondary border border-border rounded-full px-3 py-0.5 text-xs">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remover filtro"
        className="opacity-60 hover:opacity-100 transition-opacity ml-1"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

export function CoveragesTableToolbar({
  table,
  globalFilter,
  onGlobalFilterChange,
}: TableFilterProps) {
  const uniqueCards = useMemo(
    () => [...new Set(table.options.data.map(d => d.cardName))].sort(),
    [table.options.data],
  )

  const statusFilter = table.getColumn('settledAt')?.getFilterValue() as StatusFilter | undefined
  const cardFilter = table.getColumn('cardName')?.getFilterValue() as string | undefined

  return (
    <div className="flex items-center gap-2">
      <InputGroup className="flex-1 dark:bg-background text-sm">
        <InputGroupInput
          value={globalFilter}
          onChange={e => onGlobalFilterChange(e.target.value)}
          placeholder="Buscar membro..."
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            data-active={!!statusFilter}
            className={cn(statusFilter && 'border-primary text-primary bg-primary/5')}
          >
            {STATUS_OPTIONS.find(o => o.value === statusFilter)?.label ?? 'Status'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => table.getColumn('settledAt')?.setFilterValue(undefined)}>
            Todos
            {!statusFilter && <Check className="size-4 ml-auto" />}
          </DropdownMenuItem>
          {STATUS_OPTIONS.map(opt => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => table.getColumn('settledAt')?.setFilterValue(opt.value)}
            >
              {opt.label}
              {statusFilter === opt.value && <Check className="size-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            data-active={!!cardFilter}
            className={cn(cardFilter && 'border-primary text-primary bg-primary/5')}
          >
            {cardFilter ?? 'Cartão'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Cartão</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => table.getColumn('cardName')?.setFilterValue(undefined)}>
            Todos
            {!cardFilter && <Check className="size-4 ml-auto" />}
          </DropdownMenuItem>
          {uniqueCards.map(card => (
            <DropdownMenuItem
              key={card}
              onClick={() => table.getColumn('cardName')?.setFilterValue(card)}
            >
              {card}
              {cardFilter === card && <Check className="size-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="px-2">
            <Columns3 className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Colunas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(col => col.getCanHide())
            .map(col => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={col.getIsVisible()}
                onCheckedChange={value => col.toggleVisibility(value)}
              >
                {col.columnDef.meta?.label ?? col.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function CoveragesActiveFilters({
  table,
  globalFilter,
  onGlobalFilterChange,
}: TableFilterProps) {
  const statusFilter = table.getColumn('settledAt')?.getFilterValue() as StatusFilter | undefined
  const cardFilter = table.getColumn('cardName')?.getFilterValue() as string | undefined

  const hasFilters = !!globalFilter || !!statusFilter || !!cardFilter

  if (!hasFilters) return null

  function clearAll() {
    onGlobalFilterChange('')
    table.getColumn('settledAt')?.setFilterValue(undefined)
    table.getColumn('cardName')?.setFilterValue(undefined)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {globalFilter && (
        <FilterChip label={globalFilter} onRemove={() => onGlobalFilterChange('')} />
      )}

      {statusFilter && (
        <FilterChip
          label={STATUS_OPTIONS.find(o => o.value === statusFilter)?.label ?? statusFilter}
          onRemove={() => table.getColumn('settledAt')?.setFilterValue(undefined)}
        />
      )}

      {cardFilter && (
        <FilterChip
          label={cardFilter}
          onRemove={() => table.getColumn('cardName')?.setFilterValue(undefined)}
        />
      )}

      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
      >
        Limpar tudo
      </button>
    </div>
  )
}
