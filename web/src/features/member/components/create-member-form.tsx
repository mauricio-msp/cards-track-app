import { Loader, UserPlus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller } from 'react-hook-form'

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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateMemberForm } from '@/features/member/hooks'
import { RELATIONSHIPS } from '@/helpers/relationships'

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
                  placeholder="John Doe"
                  {...register('name')}
                />
              </InputGroup>
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.relationship} className="gap-1">
              <FieldLabel>Relacionamento</FieldLabel>
              <Controller
                name="relationship"
                control={control}
                render={({ field }) => (
                  <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!errors.relationship}>
                      <SelectValue placeholder="Selecione um relacionamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {RELATIONSHIPS.map(relation => (
                          <SelectItem key={relation} value={relation.toLowerCase()}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.relationship && <FieldError>{errors.relationship.message}</FieldError>}
            </Field>
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
