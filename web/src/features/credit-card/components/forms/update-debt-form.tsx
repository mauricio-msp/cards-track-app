import { Loader, Save } from 'lucide-react'
import type { ReactNode } from 'react'
import type { z } from 'zod'

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
import type { GetCardDebtsItem } from '@/features/credit-card/api/get-card-debts'
import { DebtFormFields } from '@/features/credit-card/components/forms/debt-form-fields'
import { useUpdateDebtForm } from '@/features/credit-card/hooks'

type Debt = z.infer<typeof GetCardDebtsItem>

interface UpdateDebtFormProps {
  debt: Debt
  children: ReactNode
}

export function UpdateDebtForm({ debt, children }: UpdateDebtFormProps) {
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
  } = useUpdateDebtForm(debt)

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
            <DialogTitle>Editar despesa</DialogTitle>
            <DialogDescription>Atualize as informações da despesa selecionada.</DialogDescription>
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
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isPending} variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? <Loader className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
