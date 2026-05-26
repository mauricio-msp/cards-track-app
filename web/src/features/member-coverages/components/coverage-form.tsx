import { BanknoteArrowUp, CalendarIcon, Loader } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMemberCoverageForm } from '@/features/member-coverages/hooks/forms/use-member-coverage-form'
import { cn } from '@/lib/utils'

type CoverageFormProps = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  prefillAmountCents?: number
  onCancel?: () => void
  onSuccess?: () => void
}

export function CoverageForm({
  memberId,
  cardId,
  targetMonth,
  targetYear,
  prefillAmountCents,
  onCancel,
  onSuccess,
}: CoverageFormProps) {
  const { form, isPending, onSubmit } = useMemberCoverageForm({
    memberId,
    cardId,
    targetMonth,
    targetYear,
    prefillAmountCents,
    onSuccess,
  })

  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Field data-invalid={!!errors.amount} className="gap-1">
          <FieldLabel>Valor coberto</FieldLabel>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                value={field.value}
                aria-invalid={!!errors.amount}
                onChange={e => field.onChange(e.target.value)}
              />
            )}
          />
          {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.coveredAt} className="gap-1">
          <FieldLabel>Data</FieldLabel>
          <Controller
            control={control}
            name="coveredAt"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-invalid={!!errors.coveredAt}
                    className={cn(
                      'justify-start font-normal gap-2 px-3',
                      !!errors.coveredAt && 'border-destructive text-destructive',
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
          {errors.coveredAt && <FieldError>{errors.coveredAt.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.description} className="gap-1">
          <FieldLabel>
            Descrição <span className="text-muted-foreground">(opcional)</span>
          </FieldLabel>
          <Input
            id="description"
            placeholder="Ex: Fatura maio, Pix emergencial..."
            aria-invalid={!!errors.description}
            {...register('description')}
          />
          {errors.description && <FieldError>{errors.description.message}</FieldError>}
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <BanknoteArrowUp className="size-4" />
          )}
          {isPending ? 'Salvando...' : 'Registrar cobertura'}
        </Button>
      </DialogFooter>
    </form>
  )
}
