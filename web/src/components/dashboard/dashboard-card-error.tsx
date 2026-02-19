import { AlertTriangle, RotateCcw } from 'lucide-react'
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface DashboardCardErrorProps extends FallbackProps {
  title: string
  icon: React.ElementType
}

export function DashboardCardError({
  title,
  icon: Icon,
  resetErrorBoundary,
}: DashboardCardErrorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{title}</span>
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-start justify-end gap-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          <span className="text-sm font-medium">Erro ao carregar dados</span>
        </div>

        <Button size="sm" variant="outline" className="cursor-pointer" onClick={resetErrorBoundary}>
          <RotateCcw />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}
