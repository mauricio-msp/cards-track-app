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
import type { GetCardPurchasesItem } from '@/features/credit-card/api/get-card-purchases'
import { PurchaseFormFields } from '@/features/credit-card/components/forms/purchase-form-fields'
import { useUpdatePurchaseForm } from '@/features/credit-card/hooks'

type Purchase = z.infer<typeof GetCardPurchasesItem>

interface UpdatePurchaseFormProps {
  purchase: Purchase
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UpdatePurchaseForm({ purchase, children, open, onOpenChange }: UpdatePurchaseFormProps) {
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
  } = useUpdatePurchaseForm(purchase)

  const {
    control,
    register,
    formState: { errors },
  } = form

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}

      <DialogContent className="sm:max-w-xl" onCloseAutoFocus={() => form.reset()}>
        <form onSubmit={onSubmit} className="flex flex-col justify-end flex-1 gap-4">
          <DialogHeader>
            <DialogTitle>Editar despesa</DialogTitle>
            <DialogDescription>Atualize as informações da despesa selecionada.</DialogDescription>
          </DialogHeader>

          <PurchaseFormFields
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
