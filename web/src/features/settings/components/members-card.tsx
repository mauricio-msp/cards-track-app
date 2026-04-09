import { Pencil, Plus, Star, Trash2, Users } from 'lucide-react'
import React, { useState } from 'react'
import { DeleteAlertDialog } from '@/components/delete-alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CreateMemberForm } from '@/features/member/components/create-member-form'
import { useMembers } from '@/features/member/hooks'
import { useDeleteMember } from '@/features/member/hooks/use-delete-member'
import { formatPhone, getInitialLetters } from '@/lib/utils'

export function MembersCard() {
  const {
    data: { members },
  } = useMembers()
  const { mutateAsync: deleteMemberFn } = useDeleteMember()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const titularMember = members.find(member => member.relationship === 'Titular')
  const otherMembers = members
    .filter(member => member.relationship !== 'Titular')
    .sort((a, b) => a.name.localeCompare(b.name))
  const sortedMembers = titularMember ? [titularMember, ...otherMembers] : otherMembers

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
        {sortedMembers.map((member, index) => (
          <React.Fragment key={member.id}>
            {index > 0 && <Separator />}
            <div className="flex items-center gap-3 py-3">
              <Avatar className="size-9">
                <AvatarFallback className="text-sm">
                  {getInitialLetters(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate inline-flex items-center gap-1">
                  {member.name}{' '}
                  {member.relationship === 'Titular' && <Star className="size-3 text-amber-400" />}
                </span>
                <span className="text-xs text-muted-foreground">{member.relationship}</span>
                {member.phone && (
                  <span className="text-xs text-muted-foreground">{formatPhone(member.phone)}</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="min-w-20">
                  <Pencil className="size-3.5" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="min-w-20"
                  onClick={() => setDeleteTarget({ id: member.id, name: member.name })}
                >
                  <Trash2 className="size-3.5" />
                  Excluir
                </Button>
              </div>
            </div>
          </React.Fragment>
        ))}

        {sortedMembers.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum membro cadastrado.
          </p>
        )}
      </CardContent>

      <DeleteAlertDialog
        open={deleteTarget !== null}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="Excluir membro"
        description={
          <>
            Tem certeza que deseja excluir <strong>{deleteTarget?.name}</strong>? Esta ação não pode
            ser desfeita.
          </>
        }
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteMemberFn(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
      />
    </Card>
  )
}
