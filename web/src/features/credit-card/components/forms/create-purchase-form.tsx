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

import { PurchaseFormFields } from '@/features/credit-card/components/forms/purchase-form-fields'
import { useCreatePurchaseForm } from '@/features/credit-card/hooks'

export function CreatePurchaseForm({ children }: { children: ReactNode }) {
  const {
    form,
    fields,
    isPending,
    onSubmit,
    resetAll,
    calendar,
    installments,
    members,
    recurring,
    ai,
  } = useCreatePurchaseForm()

  const {
    control,
    register,
    formState: { errors },
  } = form

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl gap-0" onCloseAutoFocus={resetAll}>
        <DialogHeader className="pb-2">
          <DialogTitle>Adicionar despesa</DialogTitle>
          <DialogDescription>
            Registre uma nova compra e associe ao cartão de crédito.
          </DialogDescription>
        </DialogHeader>

        <form id="form-purchase" onSubmit={onSubmit} className="flex flex-col justify-end flex-1">
          <PurchaseFormFields
            ai={ai}
            form={{ control, register, errors, fields, isPending }}
            members={members}
            calendar={calendar}
            recurring={recurring}
            installments={installments}
          />
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={isPending} variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="form-purchase"
            className="cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <PlusCircle className="size-4" />
            )}
            {isPending ? 'Salvando...' : 'Adicionar despesa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
