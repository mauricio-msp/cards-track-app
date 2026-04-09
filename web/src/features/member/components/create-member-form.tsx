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
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
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
import { applyPhoneMask } from '@/lib/utils'

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

            <Field data-invalid={!!errors.phone} className="gap-1">
              <FieldLabel>Telefone (opcional)</FieldLabel>
              <InputGroup>
                <InputGroupAddon
                  align="inline-start"
                  className="gap-1.5 border-r border-input pr-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="16"
                    viewBox="0 0 32 32"
                    aria-label="Bandeira do Brasil"
                  >
                    <title>Bandeira do Brasil</title>
                    <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#459a45" />
                    <path
                      d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
                      opacity=".15"
                    />
                    <path d="M3.472,16l12.528,8,12.528-8-12.528-8L3.472,16Z" fill="#fedf00" />
                    <circle cx="16" cy="16" r="5" fill="#0a2172" />
                    <path
                      d="M14,14.5c-.997,0-1.958,.149-2.873,.409-.078,.35-.126,.71-.127,1.083,.944-.315,1.951-.493,2.999-.493,2.524,0,4.816,.996,6.519,2.608,.152-.326,.276-.666,.356-1.026-1.844-1.604-4.245-2.583-6.875-2.583Z"
                      fill="#fff"
                    />
                    <path
                      d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
                      fill="#fff"
                      opacity=".2"
                    />
                  </svg>
                  <span className="text-xs font-medium">+55</span>
                </InputGroupAddon>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <InputGroupInput
                      disabled={isPending}
                      aria-invalid={!!errors.phone}
                      placeholder="(11) 99999-9999"
                      value={field.value ?? ''}
                      onChange={e => field.onChange(applyPhoneMask(e.target.value))}
                    />
                  )}
                />
              </InputGroup>
              {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
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
