import { AlertTriangle, RotateCcw, Users } from 'lucide-react'
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface MembersNavErrorProps extends FallbackProps {
  title: string
}

export function MembersNavError({ title, resetErrorBoundary }: MembersNavErrorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{title}</span>
          <Users className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-start justify-end gap-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-4" />
          <span className="text-sm font-medium">Erro ao carregar membros</span>
        </div>

        <Button size="sm" variant="outline" onClick={resetErrorBoundary}>
          <RotateCcw />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  )
}
