import { useRouteContext } from '@tanstack/react-router'
import { Pencil, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getInitialLetters } from '@/lib/utils'

export function ProfileCard() {
  const { user } = useRouteContext({ from: '/_app' })

  return (
    <Card>
      <CardHeader className="justify-items-start">
        <CardTitle className="flex items-center gap-2">
          <User className="size-4" />
          Perfil
        </CardTitle>
        <CardDescription>
          Informações da sua conta. A edição estará disponível em breve.
        </CardDescription>
        <Button variant="outline" size="sm" className="shrink-0 self-start" disabled>
          <Pencil className="size-3.5" />
          Editar perfil
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 p-5 rounded-lg border bg-muted/20">
          <Avatar className="size-16">
            <AvatarImage src={user.image ?? ''} alt={user.name} />
            <AvatarFallback className="text-lg">{getInitialLetters(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium">{user.name ?? '—'}</p>
            <p className="text-sm text-muted-foreground">{user.email ?? '—'}</p>
            <Badge variant="secondary" className="w-fit mt-1">
              Conta pessoal
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
