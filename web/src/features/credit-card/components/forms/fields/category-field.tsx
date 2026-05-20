import type { Control, FieldErrors } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { CATEGORIES } from '@/features/credit-card/categories'
import type { CreatePurchaseFormValues } from '@/features/credit-card/hooks'
import { RELATIONSHIPS } from '@/helpers/relationships'

type CategoryFieldProps = {
  control: Control<CreatePurchaseFormValues>
  errors: FieldErrors<CreatePurchaseFormValues>
}

export function CategoryField({ control, errors }: CategoryFieldProps) {
  return (
    <Field data-invalid={!!errors.category} className="gap-1">
      <FieldLabel>Categoria</FieldLabel>
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Combobox items={CATEGORIES} value={field.value || ''} onValueChange={field.onChange}>
            <ComboboxInput placeholder="Selecione uma categoria" />
            <ComboboxContent
              className="pointer-events-auto"
              onWheel={event => event.stopPropagation()}
            >
              <ComboboxEmpty>Nenhuma categoria encontrada.</ComboboxEmpty>
              <ComboboxList>
                {(group, index) => (
                  <ComboboxGroup key={group.value} items={group.items}>
                    <ComboboxLabel>{group.value}</ComboboxLabel>
                    <ComboboxCollection>
                      {item => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                    {index < RELATIONSHIPS.length - 1 && <ComboboxSeparator />}
                  </ComboboxGroup>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        )}
      />
      {errors.category && <FieldError>{errors.category.message}</FieldError>}
    </Field>
  )
}
