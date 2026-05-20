import { Layers } from 'lucide-react'
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

type InstallmentsCardProps = {
  installmentsEnabled: boolean
  setInstallmentsEnabled: (enabled: boolean) => void
  isRecurring: boolean
  setIsRecurring: (value: boolean) => void
  register: UseFormRegister<CreatePurchaseFormValues>
  errors: FieldErrors<CreatePurchaseFormValues>
  isPending: boolean
}

export function InstallmentsCard({
  installmentsEnabled,
  setInstallmentsEnabled,
  isRecurring,
  setIsRecurring,
  register,
  errors,
  isPending,
}: InstallmentsCardProps) {
  return (
    <div
      data-active={installmentsEnabled || undefined}
      data-disabled={isRecurring || undefined}
      className="border rounded-lg p-3 flex flex-col gap-3 transition-colors data-active:border-primary/50 data-active:bg-primary/5 data-disabled:pointer-events-none data-disabled:opacity-50"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium leading-tight flex items-center gap-1">
            <Layers className="size-4" />
            Compra parcelada
          </p>
          <span className="text-xs text-muted-foreground mt-0.5">
            Ative se a compra foi feita em parcelas.
          </span>
        </div>

        <Switch
          id="switch-purchase"
          checked={installmentsEnabled}
          disabled={isRecurring}
          onCheckedChange={v => {
            setInstallmentsEnabled(v)
            if (v) setIsRecurring(false)
          }}
        />
      </div>

      {installmentsEnabled && (
        <>
          <Separator />
          <Field data-invalid={!!errors.installmentsCount} className="gap-1 w-40">
            <FieldLabel htmlFor="installmentsCount">Número de parcelas</FieldLabel>
            <InputGroup className="dark:bg-background">
              <InputGroupAddon>
                <InputGroupText>Em</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="installmentsCount"
                disabled={isPending}
                placeholder="0"
                aria-invalid={!!errors.installmentsCount}
                {...register('installmentsCount', { valueAsNumber: true })}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>x</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {errors.installmentsCount && (
              <FieldError>{errors.installmentsCount.message}</FieldError>
            )}
          </Field>
        </>
      )}
    </div>
  )
}
