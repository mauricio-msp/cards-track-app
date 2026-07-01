import { Loader, Save } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
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
import { useUpdateCardForm } from '@/features/credit-card/hooks'
import { creditCards } from '@/helpers/credit-cards'

type Card = {
  id: string
  name: string
  limit: number
  closingOffsetDays: number
  dueDay: number
  anticipationMode: 'none' | 'gap' | 'tail'
}

interface UpdateCardFormProps {
  card: Card
  children: ReactNode
}

export function UpdateCardForm({ card, children }: UpdateCardFormProps) {
  const [open, setOpen] = useState(false)
  const { form, isPending, onSubmit, resetToCard } = useUpdateCardForm(card, () => setOpen(false))
  const {
    control,
    register,
    formState: { errors },
  } = form

  const currentCreditCard = creditCards.find(
    cc => cc.name.toLowerCase() === card.name.toLowerCase(),
  )

  const { onChange: onLimitChange, ...limitRegister } = register('limit')

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) resetToCard()
    setOpen(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col justify-end flex-1 gap-4">
          <DialogHeader>
            <DialogTitle>Editar cartão de crédito</DialogTitle>
            <DialogDescription>
              Atualize as informações do cartão de crédito selecionado.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <div className="flex items-center gap-2 opacity-50 pointer-events-none select-none px-1">
              {currentCreditCard?.icon({}) ?? null}
              <span className="text-sm font-medium capitalize text-muted-foreground">
                {card.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">(não editável)</span>
            </div>

            <Field data-invalid={!!errors.limit}>
              <FieldLabel
                htmlFor="limit"
                className="text-primary/70 text-xs uppercase tracking-wider"
              >
                Limite do cartão
              </FieldLabel>
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
              {isPending ? <Loader className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
