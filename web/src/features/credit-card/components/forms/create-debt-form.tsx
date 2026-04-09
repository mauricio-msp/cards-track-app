import { Loader, PlusCircle } from 'lucide-react'
import type { ReactNode } from 'react'

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

import { DebtFormFields } from '@/features/credit-card/components/forms/debt-form-fields'
import { useCreateDebtForm } from '@/features/credit-card/hooks'

export function CreateDebtForm({ children }: { children: ReactNode }) {
  const {
    form,
    fields,
    isPending,
    calendarOpen,
    setCalendarOpen,
    installmentsEnabled,
    setInstallmentsEnabled,
    totalAmountInCents,
    selectedMembersForCombobox,
    membersStore,
    handleMembersChange,
    onSubmit,
    isRecurring,
    setIsRecurring,
  } = useCreateDebtForm()

  const {
    control,
    register,
    formState: { errors },
  } = form

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-xl" onCloseAutoFocus={() => form.reset()}>
        <form onSubmit={onSubmit} className="flex flex-col justify-end flex-1 gap-4">
          <DialogHeader>
            <DialogTitle>Adicionar despesa</DialogTitle>
            <DialogDescription>
              Registre uma nova compra e associe ao cartão de crédito.
            </DialogDescription>
          </DialogHeader>

          <DebtFormFields
            control={control}
            register={register}
            errors={errors}
            fields={fields}
            isPending={isPending}
            calendarOpen={calendarOpen}
            setCalendarOpen={setCalendarOpen}
            installmentsEnabled={installmentsEnabled}
            setInstallmentsEnabled={setInstallmentsEnabled}
            totalAmountInCents={totalAmountInCents}
            membersStore={membersStore}
            selectedMembersForCombobox={selectedMembersForCombobox}
            handleMembersChange={handleMembersChange}
            isRecurring={isRecurring}
            setIsRecurring={setIsRecurring}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isPending} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <PlusCircle className="size-4" />
              )}
              {isPending ? 'Salvando...' : 'Adicionar despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
