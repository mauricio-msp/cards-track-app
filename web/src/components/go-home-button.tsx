import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'

export function GoHomeButton() {
  const isMobile = useIsMobile()

  return (
    <Button variant="outline" className="self-start cursor-pointer" asChild>
      <Link to="/dashboard">
        <ArrowLeft />
        {!isMobile && 'Voltar para o dashboard'}
      </Link>
    </Button>
  )
}
