import type { Control, FieldArrayWithId, FieldErrors, UseFormRegister } from 'react-hook-form'

import { FieldGroup } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'

import type { ParsedPurchaseAI } from '@/features/credit-card/api/parse-purchase-with-ai'
import { AiField } from '@/features/credit-card/components/forms/fields/ai-field'
import { CategoryField } from '@/features/credit-card/components/forms/fields/category-field'
import { DescriptionField } from '@/features/credit-card/components/forms/fields/description-field'
import { InstallmentsCard } from '@/features/credit-card/components/forms/fields/installments-card'
import { MemberAmountsField } from '@/features/credit-card/components/forms/fields/member-amounts-field'
import { MembersComboboxField } from '@/features/credit-card/components/forms/fields/members-combobox-field'
import { PurchaseDateField } from '@/features/credit-card/components/forms/fields/purchase-date-field'
import { PurchaseSummary } from '@/features/credit-card/components/forms/fields/purchase-summary'
import { RecurringCard } from '@/features/credit-card/components/forms/fields/recurring-card'

import type { CreatePurchaseFormValues } from '@/features/credit-card/hooks'
import type { Member } from '@/features/member/api/get-members'

export type PurchaseFormFieldsProps = {
  form: {
    control: Control<CreatePurchaseFormValues>
    register: UseFormRegister<CreatePurchaseFormValues>
    errors: FieldErrors<CreatePurchaseFormValues>
    fields: FieldArrayWithId<CreatePurchaseFormValues, 'members', '_rhf_id'>[]
    isPending: boolean
  }
  calendar: {
    open: boolean
    setOpen: (open: boolean) => void
  }
  installments: {
    installmentsEnabled: boolean
    setInstallmentsEnabled: (enabled: boolean) => void
    installmentsCount: number
    totalAmountInCents: number
  }
  members: {
    membersStore: Member[]
    selectedMembersForCombobox: Member[]
    handleMembersChange: (selected: Member[]) => void
  }
  recurring: {
    isRecurring: boolean
    setIsRecurring: (value: boolean) => void
  }
  ai: {
    aiText: string
    setAiText: (v: string) => void
    isParsing: boolean
    missingFields: string[]
    parsedFields: ParsedPurchaseAI | null
    unknownMemberNames: string[]
    handleParsePurchase: () => void
  }
}

export function PurchaseFormFields({
  form: { control, register, errors, fields, isPending },
  calendar: { open: calendarOpen, setOpen: setCalendarOpen },
  installments: {
    installmentsEnabled,
    setInstallmentsEnabled,
    installmentsCount,
    totalAmountInCents,
  },
  members: { membersStore, selectedMembersForCombobox, handleMembersChange },
  recurring: { isRecurring, setIsRecurring },
  ai: {
    aiText,
    setAiText,
    isParsing,
    missingFields,
    parsedFields,
    unknownMemberNames,
    handleParsePurchase,
  },
}: PurchaseFormFieldsProps) {
  return (
    <div className="-mx-4 max-h-[80vh] overflow-y-auto px-4 py-3">
      <FieldGroup>
        <AiField
          aiText={aiText}
          setAiText={setAiText}
          isParsing={isParsing}
          isPending={isPending}
          parsedFields={parsedFields}
          missingFields={missingFields}
          unknownMemberNames={unknownMemberNames}
          handleParsePurchase={handleParsePurchase}
        />
      </FieldGroup>

      <Separator className="my-4" />

      <FieldGroup>
        <DescriptionField register={register} errors={errors} isPending={isPending} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PurchaseDateField
            control={control}
            errors={errors}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
          />
          <CategoryField control={control} errors={errors} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InstallmentsCard
            installmentsEnabled={installmentsEnabled}
            setInstallmentsEnabled={setInstallmentsEnabled}
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            register={register}
            errors={errors}
            isPending={isPending}
          />
          <RecurringCard
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
            installmentsEnabled={installmentsEnabled}
            register={register}
            errors={errors}
            isPending={isPending}
          />
        </div>

        <MembersComboboxField
          membersStore={membersStore}
          selectedMembersForCombobox={selectedMembersForCombobox}
          handleMembersChange={handleMembersChange}
          errors={errors}
        />

        {fields.length > 0 && (
          <MemberAmountsField
            fields={fields}
            register={register}
            errors={errors}
            isPending={isPending}
          />
        )}
      </FieldGroup>

      <Separator className="my-4" />

      <PurchaseSummary
        totalAmountInCents={totalAmountInCents}
        installmentsEnabled={installmentsEnabled}
        installmentsCount={installmentsCount}
      />
    </div>
  )
}
