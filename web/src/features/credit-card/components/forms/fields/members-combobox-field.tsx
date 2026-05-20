import React from 'react'
import type { FieldErrors } from 'react-hook-form'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import type { CreatePurchaseFormValues } from '@/features/credit-card/hooks'
import type { Member } from '@/features/member/api/get-members'

type MembersComboboxFieldProps = {
  membersStore: Member[]
  selectedMembersForCombobox: Member[]
  handleMembersChange: (selected: Member[]) => void
  errors: FieldErrors<CreatePurchaseFormValues>
}

export function MembersComboboxField({
  membersStore,
  selectedMembersForCombobox,
  handleMembersChange,
  errors,
}: MembersComboboxFieldProps) {
  const anchor = useComboboxAnchor()

  return (
    <Field data-invalid={!!errors.members?.message} className="gap-1">
      <FieldLabel>Selecionar membros</FieldLabel>
      <Combobox
        multiple
        items={membersStore}
        value={selectedMembersForCombobox}
        onValueChange={(selected: Member[]) => handleMembersChange(selected)}
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(values: Member[]) => (
              <React.Fragment>
                {values.map(value => (
                  <ComboboxChip key={value.id}>{value.name}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  placeholder="Adicione um ou mais membros"
                  aria-invalid={!!errors.members?.message}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>

        <ComboboxContent anchor={anchor} className="pointer-events-auto">
          <ComboboxEmpty>Nenhum membro encontrado.</ComboboxEmpty>
          <ComboboxList>
            {(item: Member) => (
              <ComboboxItem key={item.id} value={item}>
                {item.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {errors.members?.message && <FieldError>{errors.members.message}</FieldError>}
    </Field>
  )
}
