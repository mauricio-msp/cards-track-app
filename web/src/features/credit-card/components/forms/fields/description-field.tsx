import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import type { CreatePurchaseFormValues } from '@/features/credit-card/hooks'

type DescriptionFieldProps = {
  register: UseFormRegister<CreatePurchaseFormValues>
  errors: FieldErrors<CreatePurchaseFormValues>
  isPending: boolean
}

export function DescriptionField({ register, errors, isPending }: DescriptionFieldProps) {
  return (
    <Field data-invalid={!!errors.description} className="gap-1">
      <FieldLabel>Descrição da compra</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="description"
          disabled={isPending}
          aria-invalid={!!errors.description}
          placeholder="ex: iPhone 15, Supermercado, Assinatura"
          {...register('description')}
        />
      </InputGroup>
      {errors.description && <FieldError>{errors.description.message}</FieldError>}
    </Field>
  )
}
