import { useNavigate } from '@tanstack/react-router'
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowData,
  type SortingFn,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Clock,
} from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AllCoverageItem } from '@/features/coverages-summary/api/get-all-coverages'
import { creditCards } from '@/helpers/credit-cards'
import { MONTHS } from '@/helpers/months'
import { formatPrice } from '@/lib/utils'
import { CoveragesActiveFilters, CoveragesTableToolbar } from './coverages-table-toolbar'

declare module '@tanstack/react-table' {
  interface FilterFns {
    statusFilter: FilterFn<unknown>
  }
  interface SortingFns {
    periodSort: SortingFn<unknown>
  }
  interface ColumnMeta<TData extends RowData, TValue> {
    label: string
  }
}

const PAGE_SIZE = 15

const filterFns: Record<string, FilterFn<AllCoverageItem>> = {
  statusFilter: (row, _, filterValue: 'settled' | 'pending') =>
    filterValue === 'settled' ? !!row.original.settledAt : !row.original.settledAt,
}

const sortingFns: Record<string, SortingFn<AllCoverageItem>> = {
  periodSort: (rowA, rowB) => {
    const a = rowA.original.targetYear * 12 + rowA.original.targetMonth
    const b = rowB.original.targetYear * 12 + rowB.original.targetMonth
    return a - b
  },
}

function SortableHeader({
  column,
  children,
}: {
  column: Column<AllCoverageItem>
  children: React.ReactNode
}) {
  const sorted = column.getIsSorted()
  return (
    <button
      type="button"
      className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      {sorted === 'asc' ? (
        <ChevronUp className="size-3" />
      ) : sorted === 'desc' ? (
        <ChevronDown className="size-3" />
      ) : (
        <ChevronsUpDown className="size-3 opacity-40" />
      )}
    </button>
  )
}

const columns: ColumnDef<AllCoverageItem>[] = [
  {
    accessorKey: 'memberName',
    enableSorting: true,
    enableGlobalFilter: true,
    enableColumnFilter: false,
    meta: { label: 'Membro' },
    header: ({ column }) => <SortableHeader column={column}>Membro</SortableHeader>,
    cell: ({ row }) => <span className="font-medium">{row.original.memberName}</span>,
  },
  {
    accessorKey: 'cardName',
    enableSorting: false,
    enableGlobalFilter: false,
    enableColumnFilter: true,
    filterFn: 'equals',
    meta: { label: 'Cartão' },
    header: 'Cartão',
    cell: ({ row }) => {
      const card = creditCards.find(
        cc => cc.name.toLowerCase() === row.original.cardName.toLowerCase(),
      )
      return (
        <div className="flex items-center gap-2">
          {card?.icon({})}
          <span>{row.original.cardName}</span>
        </div>
      )
    },
  },
  {
    id: 'period',
    enableSorting: true,
    enableGlobalFilter: false,
    enableColumnFilter: false,
    sortingFn: 'periodSort',
    meta: { label: 'Mês/Ano' },
    header: ({ column }) => <SortableHeader column={column}>Mês/Ano</SortableHeader>,
    cell: ({ row }) => {
      const month = MONTHS[row.original.targetMonth]
      return (
        <span className="text-muted-foreground">
          {month?.slice(0, 3)}/{row.original.targetYear}
        </span>
      )
    },
  },
  {
    accessorKey: 'amount',
    enableSorting: true,
    enableGlobalFilter: false,
    enableColumnFilter: false,
    meta: { label: 'Valor' },
    header: ({ column }) => <SortableHeader column={column}>Valor</SortableHeader>,
    cell: ({ row }) => formatPrice(row.original.amount / 100),
  },
  {
    accessorKey: 'settledAt',
    enableSorting: true,
    enableGlobalFilter: false,
    enableColumnFilter: true,
    filterFn: 'statusFilter',
    meta: { label: 'Status' },
    header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
    cell: ({ row }) =>
      row.original.settledAt ? (
        <Check className="size-4 text-green-500" />
      ) : (
        <Clock className="size-4 text-amber-500" />
      ),
  },
]

type CoveragesTableProps = {
  coverages: AllCoverageItem[]
}

export function CoveragesTable({ coverages }: CoveragesTableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rawFilter, setRawFilter] = useState('')
  const globalFilter = useDeferredValue(rawFilter)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data: coverages,
    columns,
    initialState: { pagination: { pageSize: PAGE_SIZE, pageIndex: 0 } },
    state: { sorting, columnFilters, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setRawFilter,
    onColumnVisibilityChange: setColumnVisibility,
    autoResetPageIndex: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    filterFns,
    sortingFns,
  })

  const { pageIndex, pageSize } = table.getState().pagination

  return (
    <div className="flex flex-col gap-3">
      <CoveragesTableToolbar
        table={table}
        globalFilter={rawFilter}
        onGlobalFilterChange={setRawFilter}
      />

      <CoveragesActiveFilters
        table={table}
        globalFilter={rawFilter}
        onGlobalFilterChange={setRawFilter}
      />

      <div className="rounded-xl border overflow-hidden">
        <Table className="bg-background">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/60"
                onClick={() =>
                  navigate({
                    to: '/members/$id',
                    params: { id: row.original.memberId },
                    search: {
                      coverageCardId: row.original.cardId,
                      coverageMonth: row.original.targetMonth,
                      coverageYear: row.original.targetYear,
                      month: row.original.targetMonth,
                      year: row.original.targetYear,
                    },
                  })
                }
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {pageIndex * pageSize + 1} –{' '}
            {Math.min((pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)} de{' '}
            {table.getFilteredRowModel().rows.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2">
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Próxima página"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
