import { Loader, Save } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MemberFormFields } from '@/features/member/components/member-form-fields'
import { useUpdateMemberForm } from '@/features/member/hooks/use-update-member-form'

type Member = {
  id: string
  name: string
  relationship: string
  phone?: string | null
}

interface UpdateMemberFormProps {
  member: Member
  children: ReactNode
}

export function UpdateMemberForm({ member, children }: UpdateMemberFormProps) {
  const [open, setOpen] = useState(false)
  const { form, isPending, onSubmit, resetToMember } = useUpdateMemberForm(member, () =>
    setOpen(false),
  )
  const {
    control,
    register,
    formState: { errors },
  } = form

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) resetToMember()
    setOpen(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} className="flex flex-col justify-end flex-1 gap-4">
          <DialogHeader>
            <DialogTitle>Editar membro</DialogTitle>
            <DialogDescription>Atualize as informações do membro selecionado.</DialogDescription>
          </DialogHeader>

          <MemberFormFields
            control={control}
            register={register}
            errors={errors}
            isPending={isPending}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isPending} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? <Loader className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
