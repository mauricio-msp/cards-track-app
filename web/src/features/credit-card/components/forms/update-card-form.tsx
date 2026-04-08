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
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'

import { useUpdateCardForm } from '@/features/credit-card/hooks'
import { creditCards } from '@/helpers/credit-cards'
import { applyBRLMask } from '@/lib/utils'

type Card = {
  id: string
  name: string
  limit: number
  closingOffsetDays: number
  dueDay: number
}

interface UpdateCardFormProps {
  card: Card
  children: ReactNode
}

export function UpdateCardForm({ card, children }: UpdateCardFormProps) {
  const [open, setOpen] = useState(false)
  const { form, isPending, onSubmit, resetToCard } = useUpdateCardForm(card, () => setOpen(false))
  const {
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
              <InputGroup className="border-primary/50 bg-primary/5 h-auto">
                <InputGroupAddon>
                  <InputGroupText className="text-primary font-semibold">R$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="limit"
                  disabled={isPending}
                  aria-invalid={!!errors.limit}
                  placeholder="0,00"
                  inputMode="numeric"
                  className="text-2xl font-bold py-3"
                  onChange={e => {
                    e.target.value = applyBRLMask(e.target.value)
                    onLimitChange(e)
                  }}
                  {...limitRegister}
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
              {isPending ? <Loader className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
