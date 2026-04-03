// features/credit-card/components/create-card-form.tsx
import { Loader, Plus } from 'lucide-react'
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useCreateCardForm } from '@/features/credit-card/hooks'
import { creditCards } from '@/helpers/credit-cards'

export function CreateCardForm({ children }: { children: ReactNode }) {
  const { form, isPending, onSubmit } = useCreateCardForm()
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
            <DialogTitle>Adicionar cartão de crédito</DialogTitle>
            <DialogDescription>
              Adicione um novo cartão de crédito para rastrear limites, despesas e parcelamentos.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel>Credit card</FieldLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!errors.name}>
                      <SelectValue placeholder="Select a credit card" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {creditCards
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(c => (
                            <SelectItem key={c.name} value={c.name.toLowerCase()}>
                              {c.icon({})}
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.limit}>
              <FieldLabel htmlFor="limit">Credit limit</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>R$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="limit"
                  disabled={isPending}
                  aria-invalid={!!errors.limit}
                  placeholder="0.00"
                  {...register('limit')}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>BRL</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              {errors.limit && <FieldError>{errors.limit.message}</FieldError>}
            </Field>

            <div className="flex gap-4">
              <Field data-invalid={!!errors.closingOffsetDays} className="flex-1">
                <FieldLabel htmlFor="closingOffsetDays">Offset de fechamento (dias)</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="closingOffsetDays"
                    disabled={isPending}
                    placeholder="7"
                    aria-invalid={!!errors.closingOffsetDays}
                    {...register('closingOffsetDays', { valueAsNumber: true })}
                  />
                </InputGroup>
                {errors.closingOffsetDays && (
                  <FieldError>{errors.closingOffsetDays.message}</FieldError>
                )}
              </Field>

              <Field data-invalid={!!errors.dueDay} className="flex-1">
                <FieldLabel htmlFor="dueDay">Dia de vencimento</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="dueDay"
                    disabled={isPending}
                    placeholder="10"
                    aria-invalid={!!errors.dueDay}
                    {...register('dueDay', { valueAsNumber: true })}
                  />
                </InputGroup>
                {errors.dueDay && <FieldError>{errors.dueDay.message}</FieldError>}
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isPending} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? <Loader className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {isPending ? 'Criando cartão...' : 'Criar cartão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
