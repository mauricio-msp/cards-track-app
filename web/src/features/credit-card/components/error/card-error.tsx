import { AlertTriangle, RotateCcw } from 'lucide-react'
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CardErrorProps extends FallbackProps {
  title: string
  icon: React.ElementType
  className?: string
}

export function CardError({ title, icon: Icon, className, resetErrorBoundary }: CardErrorProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-start justify-end gap-2 mt-6">
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
