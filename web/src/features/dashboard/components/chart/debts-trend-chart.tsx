import React from 'react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { HiddenValue } from '@/components/ui/hidden-value'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebtsTrend } from '@/features/dashboard/hooks/use-debts-trend'
import { useDebtsYears } from '@/features/dashboard/hooks/use-debts-years'
import { creditCards } from '@/helpers/credit-cards'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatPrice } from '@/lib/utils'

export function DebtsTrendChart() {
  const [year, setYear] = React.useState<number | undefined>(undefined)
  const isMobile = useIsMobile()

  const {
    data: { years: yearsToFilter },
  } = useDebtsYears()
  const {
    data: { chartData },
  } = useDebtsTrend(year)

  const activeCardKeys = Array.from(
    new Set(chartData.flatMap(entry => Object.keys(entry).filter(k => k !== 'date'))),
  )

  const chartConfig = activeCardKeys.reduce(
    (acc, key) => {
      const cardInfo = creditCards.find(c => c.name.toLowerCase() === key)

      acc[key] = {
        label: cardInfo?.name || key,
        color: cardInfo?.color || '#000000',
        gradient: cardInfo?.gradient || [cardInfo?.color || '#000000'],
      }

      return acc
    },
    {} as Record<string, { label: string; color: string; gradient?: string[] }>,
  )

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <CardTitle>Gráfico de Dívidas</CardTitle>
          <CardDescription>Visualização das dívidas ao longo do tempo</CardDescription>
        </div>

        <Select onValueChange={value => setYear(Number(value))}>
          <SelectTrigger className="w-full sm:w-auto">
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
      </CardHeader>
      <CardContent className="h-full">
        <ChartContainer config={chartConfig} className="h-75 aspect-auto sm:size-full">
          <AreaChart
            data={chartData}
            margin={
              isMobile
                ? { top: 10, right: 10, left: 0, bottom: 5 }
                : { top: 20, right: 30, left: 20, bottom: 5 }
            }
          >
            <defs>
              {Object.entries(chartConfig).map(([key, item]) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={item?.gradient?.[0] || item.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={item?.gradient?.[1] || item.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />

            <XAxis
              dataKey="date"
              padding={{ left: isMobile ? 8 : 20, right: isMobile ? 8 : 20 }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={isMobile ? 2 : 0}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={value => {
                const date = new Date(`${value}-02`) // Adicionado -02 para evitar erro de fuso
                return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
              }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={value => {
                    const [year, month] = value.split('-')
                    const date = new Date(Number(year), Number(month) - 1)
                    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                  }}
                  formatter={(value, name, item) => {
                    return (
                      <div className="flex min-w-40 items-stretch gap-2 text-xs text-muted-foreground">
                        <div
                          className="shrink-0 rounded-[2px] w-1"
                          style={{ backgroundColor: item.color }}
                        />
                        {chartConfig[name as keyof typeof chartConfig]?.label || name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                          <HiddenValue placeholder="****">
                            {formatPrice(Number(value) / 100)}
                          </HiddenValue>
                        </div>
                      </div>
                    )
                  }}
                />
              }
            />

            {Object.entries(chartConfig).map(([key, item]) => (
              <Area
                key={key}
                dataKey={key}
                type="monotone"
                stroke={item.color}
                fill={`url(#gradient-${key})`}
                strokeWidth={2}
                fillOpacity={0.6}
                stackId="a"
              />
            ))}

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
