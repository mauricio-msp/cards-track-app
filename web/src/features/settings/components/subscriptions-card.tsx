import { Pencil, RefreshCw, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
// import { DeleteAlertDialog } from '@/components/delete-alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useDeleteSubscription } from '@/features/subscriptions/hooks/use-delete-subscription'
import { useSubscriptions } from '@/features/subscriptions/hooks/use-subscriptions'
import { useUpdateSubscription } from '@/features/subscriptions/hooks/use-update-subscription'
import { applyBRLMask, formatPrice } from '@/lib/utils'

type EditState = {
  id: string
  name: string
  amount: string
  billingDay: string
}

function amountToBRL(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

function brlToAmountCents(value: string): number {
  return Math.round(parseFloat(value.replace(/\./g, '').replace(',', '.')) * 100)
}

export function SubscriptionsCard() {
  const {
    data: { subscriptions },
  } = useSubscriptions()

  const { mutateAsync: deleteFn } = useDeleteSubscription()
  const { mutateAsync: updateFn, isPending: isUpdating } = useUpdateSubscription()

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [editTarget, setEditTarget] = useState<EditState | null>(null)

  function openEdit(sub: { id: string; name: string; amount: number; billingDay: number }) {
    setEditTarget({
      id: sub.id,
      name: sub.name,
      amount: amountToBRL(sub.amount),
      billingDay: String(sub.billingDay),
    })
  }

  async function handleEditConfirm() {
    if (!editTarget) return
    await updateFn({
      id: editTarget.id,
      name: editTarget.name,
      amount: brlToAmountCents(editTarget.amount),
      billingDay: parseInt(editTarget.billingDay, 10),
    })
    setEditTarget(null)
  }

  return (
    <Card>
      <CardHeader className="justify-items-start">
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="size-4" />
          Assinaturas Recorrentes
        </CardTitle>
        <CardDescription>
          Cobranças fixas mensais geradas automaticamente em cada fatura.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-0">
        {subscriptions.map((sub, index) => (
          <React.Fragment key={sub.id}>
            {index > 0 && <Separator />}
            <div className="flex items-center gap-3 py-3">
              <div className="size-9 bg-muted/50 rounded-lg grid place-items-center shrink-0">
                <RefreshCw className="size-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{sub.name}</span>
                <span className="text-xs text-muted-foreground">
                  {sub.cardName} · Dia {sub.billingDay} · {sub.memberName}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-sm font-semibold">
                  {formatPrice(sub.amount / 100)}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => openEdit(sub)}>
                  <Pencil className="size-3.5" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteTarget({ id: sub.id, name: sub.name })}
                >
                  <Trash2 className="size-3.5" />
                  Excluir
                </Button>
              </div>
            </div>
          </React.Fragment>
        ))}

        {subscriptions.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma assinatura cadastrada.
          </p>
        )}
      </CardContent>

      {/* <DeleteAlertDialog
        open={deleteTarget !== null}
        onOpenChange={open => !open && setDeleteTarget(null)}
        title="Desativar assinatura"
        description={
          <>
            Deseja desativar <strong>{deleteTarget?.name}</strong>? As despesas já geradas
            permanecem, mas novos meses não serão gerados automaticamente.
          </>
        }
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteFn(deleteTarget.id)
            setDeleteTarget(null)
          }
        }}
      /> */}

      <Dialog open={editTarget !== null} onOpenChange={open => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar assinatura</DialogTitle>
          </DialogHeader>

          {editTarget && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editTarget.name}
                  onChange={e =>
                    setEditTarget(prev => (prev ? { ...prev, name: e.target.value } : prev))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-amount">Valor</Label>
                  <Input
                    id="edit-amount"
                    placeholder="R$ 0,00"
                    value={editTarget.amount}
                    onChange={e =>
                      setEditTarget(prev =>
                        prev ? { ...prev, amount: applyBRLMask(e.target.value) } : prev,
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-day">Dia de cobrança</Label>
                  <Input
                    id="edit-day"
                    type="number"
                    min={1}
                    max={31}
                    value={editTarget.billingDay}
                    onChange={e =>
                      setEditTarget(prev => (prev ? { ...prev, billingDay: e.target.value } : prev))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isUpdating}>
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleEditConfirm} disabled={isUpdating}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
