import { Pencil, Plus, Trash2, Users } from 'lucide-react'
import React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CreateMemberForm } from '@/features/member/components/create-member-form'
import { useMembers } from '@/features/member/hooks'
// import { useDeleteMember } from '@/features/member/hooks/use-delete-member'
import { getInitialLetters } from '@/lib/utils'

export function MembersCard() {
  const {
    data: { members },
  } = useMembers()
  // const { mutateAsync: deleteMemberFn } = useDeleteMember()

  return (
    <Card>
      <CardHeader className="justify-items-start">
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4" />
          Membros
        </CardTitle>
        <CardDescription>Gerencie os membros cadastrados para divisão de despesas.</CardDescription>
        <CreateMemberForm>
          <Button variant="outline" size="sm" className="shrink-0">
            <Plus className="size-3.5" />
            Adicionar
          </Button>
        </CreateMemberForm>
      </CardHeader>
      <CardContent className="flex flex-col gap-0">
        {members.map((member, index) => (
          <React.Fragment key={member.id}>
            {index > 0 && <Separator />}
            <div className="flex items-center gap-3 py-3">
              <Avatar className="size-9">
                <AvatarFallback className="text-sm">
                  {getInitialLetters(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{member.name}</span>
                <span className="text-xs text-muted-foreground">{member.relationship}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="min-w-20">
                  <Pencil className="size-3.5" />
                  Editar
                </Button>
                <Button disabled variant="destructive" size="sm" className="min-w-20">
                  <Trash2 className="size-3.5" />
                  Excluir
                </Button>
                {/* <ContextMenuDeleteItem
                  title="Remover membro"
                  description={`Tem certeza que deseja remover ${member.name}? Esta ação não pode ser desfeita.`}
                  onConfirm={() => deleteMemberFn(member.id)}
                  trigger={
                    <Button variant="outline" size="sm" className="min-w-20 text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                      Remover
                    </Button>
                  }
                /> */}
              </div>
            </div>
          </React.Fragment>
        ))}

        {members.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum membro cadastrado.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
