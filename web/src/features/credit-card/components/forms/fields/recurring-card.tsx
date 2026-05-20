import { Repeat } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import type { CreatePurchaseFormValues } from '@/features/credit-card/hooks'

type RecurringCardProps = {
  isRecurring: boolean
  setIsRecurring: (value: boolean) => void
  installmentsEnabled: boolean
  register: UseFormRegister<CreatePurchaseFormValues>
  errors: FieldErrors<CreatePurchaseFormValues>
  isPending: boolean
}

export function RecurringCard({
  isRecurring,
  setIsRecurring,
  installmentsEnabled,
  register,
  errors,
  isPending,
}: RecurringCardProps) {
  return (
    <div
      data-active={isRecurring || undefined}
      data-disabled={installmentsEnabled || undefined}
      className="border rounded-lg p-3 flex flex-col gap-3 transition-colors data-active:border-primary/50 data-active:bg-primary/5 data-disabled:pointer-events-none data-disabled:opacity-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium leading-tight flex items-center gap-1">
            <Repeat className="size-4" />
            Cobrança recorrente
          </p>
          <span className="text-xs text-muted-foreground mt-0.5">Repetida todo mês.</span>
        </div>

        <Switch
          id="switch-recurring"
          checked={isRecurring}
          disabled={installmentsEnabled}
          onCheckedChange={setIsRecurring}
        />
      </div>

      {isRecurring && (
        <>
          <Separator />
          <Field data-invalid={!!errors.billingDay} className="gap-1 w-28">
            <FieldLabel htmlFor="billingDay">Dia do mês</FieldLabel>
            <InputGroup className="dark:bg-background">
              <InputGroupInput
                id="billingDay"
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={isPending}
                aria-invalid={!!errors.billingDay}
                placeholder="ex: 10"
                className="text-right"
                {...register('billingDay', {
                  setValueAs: v => {
                    if (v === '' || v === null || v === undefined) return undefined
                    const num = parseInt(String(v), 10)
                    return Number.isNaN(num) ? undefined : Math.min(num, 31)
                  },
                  onChange: e => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 2)
                    const num = parseInt(raw, 10)
                    if (!raw) {
                      e.target.value = ''
                      return
                    }
                    e.target.value = num > 31 ? '31' : raw
                  },
                })}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>/ mês</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.billingDay && <FieldError>{errors.billingDay.message}</FieldError>}
          </Field>
        </>
      )}
    </div>
  )
}
