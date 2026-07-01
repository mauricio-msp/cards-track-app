import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
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
import { useReconcileAnticipations } from '@/features/credit-card/hooks'

export function ReconcileAnticipationsDialog({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useReconcileAnticipations(cardId)

  async function handleConfirm() {
    await mutateAsync()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon-xs"
          variant="outline"
          className="ml-2 cursor-pointer"
          aria-label="Reconciliar antecipações"
        >
          <RefreshCw />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reconciliar antecipações</DialogTitle>
          <DialogDescription>
            Reajusta as antecipações já registradas deste cartão ao modo atual (encurta o fim / pula
            meses). Use se mudou o modo do cartão ou importou dados antigos. É reversível e não
            altera valores totais — só corrige em quais meses cada parcela é cobrada.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? 'Reconciliando...' : 'Reconciliar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
