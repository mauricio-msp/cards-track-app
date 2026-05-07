import { AlertTriangle, RotateCcw } from 'lucide-react'
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MemberErrorProps extends FallbackProps {
  title: string
  icon: React.ElementType
  className?: string
}

export function MemberError({ title, icon: Icon, className, resetErrorBoundary }: MemberErrorProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5" />
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-start gap-2">
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
