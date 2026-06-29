import { Loader, UserPlus } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Control, UseFormRegister } from 'react-hook-form'

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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import {
  type MemberFieldValues,
  MemberFormFields,
} from '@/features/member/components/member-form-fields'
import { useCreateMemberForm } from '@/features/member/hooks'

export function CreateMemberForm({ children }: { children: ReactNode }) {
  const { form, isPending, onSubmit } = useCreateMemberForm()
  const {
    control,
    register,
    formState: { errors },
  } = form

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-sm" onCloseAutoFocus={() => form.reset()}>
        <form onSubmit={onSubmit} className="flex flex-col justify-end flex-1 gap-4">
          <DialogHeader>
            <DialogTitle>Adicionar membro</DialogTitle>
            <DialogDescription>
              Crie um novo membro para associar despesas, limites e compras compartilhadas.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!errors.name} className="gap-1">
              <FieldLabel>Nome do membro</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  disabled={isPending}
                  aria-invalid={!!errors.name}
                  placeholder="João da Silva"
                  {...register('name')}
                />
              </InputGroup>
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <MemberFormFields
              control={control as unknown as Control<MemberFieldValues>}
              register={register as unknown as UseFormRegister<MemberFieldValues>}
              errors={errors}
              isPending={isPending}
            />
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isPending} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {isPending ? 'Registrando membro...' : 'Registrar membro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
