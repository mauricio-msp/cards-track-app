import { AlertTriangle, LineChart, RotateCcw } from 'lucide-react'
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DebtsTrendChartErrorProps extends FallbackProps {}

export function DebtsTrendChartError({ resetErrorBoundary }: DebtsTrendChartErrorProps) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="size-5" />
          Gráfico de Dívidas
        </CardTitle>
        <CardDescription>Visualização das dívidas ao longo do tempo</CardDescription>
      </CardHeader>

      <CardContent className="h-75 sm:h-full flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex flex-col items-center gap-2 text-destructive">
          <AlertTriangle className="size-8" />
          <span className="text-sm font-medium">Erro ao carregar o gráfico</span>
        </div>

        <Button size="sm" variant="outline" className="cursor-pointer" onClick={resetErrorBoundary}>
          <RotateCcw />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}
