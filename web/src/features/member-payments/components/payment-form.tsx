import { BanknoteArrowUp, CalendarIcon, Loader, Save } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  centsToBRLMask,
  useMemberPaymentForm,
} from '@/features/member-payments/hooks/forms/use-member-payment-form'
import { cn } from '@/lib/utils'

type PaymentFormProps = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  editingPaymentId?: string
  editingAmountCents?: number
  editingPaidAt?: string
  editingDescription?: string
  remaining?: number
  onCancel?: () => void
  onSuccess?: () => void
}

export function PaymentForm({
  memberId,
  cardId,
  targetMonth,
  targetYear,
  editingPaymentId,
  editingAmountCents,
  editingPaidAt,
  editingDescription,
  remaining,
  onCancel,
  onSuccess,
}: PaymentFormProps) {
  const { form, isPending, onSubmit } = useMemberPaymentForm({
    memberId,
    cardId,
    targetMonth,
    targetYear,
    editingPaymentId,
    editingAmountCents,
    editingPaidAt,
    editingDescription,
    onSuccess,
  })

  const [isFullPayment, setIsFullPayment] = useState(false)

  const {
    register,
    control,
    formState: { errors },
  } = form

  const isEditing = !!editingPaymentId
  const showFullPaymentSwitch = !isEditing && !!remaining && remaining > 0

  function handleFullPaymentToggle(checked: boolean) {
    setIsFullPayment(checked)
    if (checked && remaining) {
      form.setValue('amount', centsToBRLMask(remaining), { shouldValidate: true })
    } else {
      form.setValue('amount', '', { shouldValidate: false })
    }
  }

  const actions = (
    <>
      <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <Loader className="size-4 animate-spin" />
        ) : isEditing ? (
          <Save className="size-4" />
        ) : (
          <BanknoteArrowUp className="size-4" />
        )}
        {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Registrar'}
      </Button>
    </>
  )

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        {showFullPaymentSwitch && (
          <div className="flex items-center gap-2">
            <Switch
              id="full-payment"
              checked={isFullPayment}
              onCheckedChange={handleFullPaymentToggle}
            />
            <label
              htmlFor="full-payment"
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Quitação total
            </label>
          </div>
        )}

        <Separator />

        <Field data-invalid={!!errors.amount} className="gap-1">
          <FieldLabel>Valor</FieldLabel>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                value={field.value}
                aria-invalid={!!errors.amount}
                disabled={isFullPayment}
                onChange={e => field.onChange(e.target.value)}
              />
            )}
          />
          {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.paidAt} className="gap-1">
          <FieldLabel>Data</FieldLabel>
          <Controller
            name="paidAt"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-invalid={!!errors.paidAt}
                    className={cn(
                      'justify-start font-normal gap-2 px-3',
                      !!errors.paidAt && 'border-destructive text-destructive',
                      !field.value && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="size-4" />
                    {field.value ? field.value.toLocaleDateString('pt-BR') : 'Selecione uma data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    defaultMonth={field.value}
                    captionLayout="dropdown"
                    onSelect={date => field.onChange(date)}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.paidAt && <FieldError>{errors.paidAt.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.description} className="gap-1">
          <FieldLabel>Descrição</FieldLabel>
          <Input
            id="description"
            placeholder="Ex: Pix dia 10, Dinheiro vivo..."
            aria-invalid={!!errors.description}
            {...register('description')}
          />
          {errors.description && <FieldError>{errors.description.message}</FieldError>}
        </Field>
      </FieldGroup>

      {isEditing ? (
        <div className="flex justify-end gap-2 pt-3 border-t">{actions}</div>
      ) : (
        <DialogFooter>{actions}</DialogFooter>
      )}
    </form>
  )
}
