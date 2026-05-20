import { ptBR } from 'react-day-picker/locale'
import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { CreatePurchaseFormValues } from '@/features/credit-card/hooks'

type PurchaseDateFieldProps = {
  control: Control<CreatePurchaseFormValues>
  errors: FieldErrors<CreatePurchaseFormValues>
  calendarOpen: boolean
  setCalendarOpen: (open: boolean) => void
}

export function PurchaseDateField({
  control,
  errors,
  calendarOpen,
  setCalendarOpen,
}: PurchaseDateFieldProps) {
  return (
    <Field data-invalid={!!errors.purchaseDate} className="gap-1">
      <FieldLabel>Data da compra</FieldLabel>
      <Controller
        name="purchaseDate"
        control={control}
        render={({ field }) => (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button id="date" variant="outline" className="justify-start font-normal">
                {field.value ? field.value.toLocaleDateString('pt-BR') : 'Selecione a data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                locale={ptBR}
                selected={field.value}
                defaultMonth={field.value}
                captionLayout="dropdown"
                onSelect={date => {
                  field.onChange(date)
                  setCalendarOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        )}
      />
      {errors.purchaseDate && <FieldError>{errors.purchaseDate.message}</FieldError>}
    </Field>
  )
}
