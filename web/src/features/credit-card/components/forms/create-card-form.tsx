import { Loader, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
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
import { ClosingOffsetDaysInput } from '@/features/credit-card/components/closing-offset-days-input'
import { useCreateCardForm } from '@/features/credit-card/hooks'
import { creditCards } from '@/helpers/credit-cards'

export function CreateCardForm({ children }: { children: ReactNode }) {
  const { form, isPending, onSubmit } = useCreateCardForm()
  const {
    control,
    register,
    formState: { errors },
  } = form

  const { onChange: onLimitChange, ...limitRegister } = register('limit')

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md" onCloseAutoFocus={() => form.reset()}>
        <form onSubmit={onSubmit} className="flex flex-col justify-end flex-1 gap-4">
          <DialogHeader>
            <DialogTitle>Adicionar cartão de crédito</DialogTitle>
            <DialogDescription>
              Adicione um novo cartão de crédito para rastrear limites, despesas e parcelamentos.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel>Cartão de Crédito</FieldLabel>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!errors.name}>
                      <SelectValue placeholder="Selecione um cartão de crédito" />
                    </SelectTrigger>
                    <SelectContent position="popper">
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
              <FieldLabel htmlFor="limit">Limite de crédito</FieldLabel>
              <CurrencyInput
                id="limit"
                disabled={isPending}
                aria-invalid={!!errors.limit}
                onChange={onLimitChange}
                {...limitRegister}
              />
              {errors.limit && <FieldError>{errors.limit.message}</FieldError>}
            </Field>

            <div className="flex gap-4">
              <ClosingOffsetDaysInput
                disabled={isPending}
                error={errors.closingOffsetDays?.message}
                {...register('closingOffsetDays', { valueAsNumber: true })}
              />

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

            <Field data-invalid={!!errors.anticipationMode}>
              <FieldLabel>Modo de antecipação</FieldLabel>
              <Controller
                name="anticipationMode"
                control={control}
                render={({ field }) => (
                  <Select disabled={isPending} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modo" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="none">Não antecipa</SelectItem>
                        <SelectItem value="gap">Pula meses (ex.: Neon)</SelectItem>
                        <SelectItem value="tail">Encurta o fim (ex.: Nubank)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Como o banco trata a antecipação: pular os próximos meses ou remover as últimas
                parcelas.
              </p>
            </Field>
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
