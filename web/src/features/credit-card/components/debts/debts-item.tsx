import { CreditCard, Dot, Pencil, Trash2, UndoDot, Zap } from 'lucide-react'
import React from 'react'
import type { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Progress } from '@/components/ui/progress'
import type { GetCardDebtsItem } from '@/features/credit-card/api/get-card-debts'
import { formatPrice } from '@/lib/utils'

type Debt = z.infer<typeof GetCardDebtsItem>

interface DebtsItemProps {
  debt: Debt
  onAnticipate: (installments: number) => void
  onDelete: (debtId: string) => void
}

export function DebtsItem({ debt, onAnticipate, onDelete }: DebtsItemProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const isAnticipated =
    !!debt.anticipatedAt && debt.elapsedInstallments === debt.anticipateFromInstallment
  const isComplete = debt.remainingInstallments === 0
  const progress = (debt.elapsedInstallments * 100) / debt.installmentsCount
  const hasRemainingAfterAnticipation = isAnticipated && debt.remainingInstallments > 0

  const totalMembersAmount = debt.members.reduce(
    (sum: number, member) => sum + member.installmentAmount / 100,
    0,
  )

  const fullDebtTotal = isAnticipated
    ? (debt.totalAmount / 100 / (debt.anticipatedInstallmentsCount ?? 1)) * debt.installmentsCount
    : (debt.totalAmount / 100) * debt.installmentsCount

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          disabled={isComplete}
          data-complete={isComplete}
          className="py-4 not-last:border-b flex items-center gap-4 data-[complete=true]:opacity-45 rounded-t-lg px-2 hover:bg-muted/30 transition-colors cursor-context-menu"
        >
          <div className="size-10 bg-muted/50 rounded-lg grid place-items-center shrink-0">
            <CreditCard className="size-4 text-muted-foreground" />
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-lg text-primary truncate">{debt.description}</p>
              {isAnticipated && (
                <Badge
                  variant="secondary"
                  className="gap-1 text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400"
                >
                  <Zap className="size-3" />
                  {hasRemainingAfterAnticipation ? 'Parcial' : 'Antecipado'}
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground flex items-center flex-wrap gap-0.5">
              <span>
                {new Date(debt.purchaseDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </span>
              <Dot />
              <Badge variant="secondary">{debt.category}</Badge>

              {debt.installmentsCount > 1 && (
                <>
                  <Dot />
                  <span>
                    {isAnticipated
                      ? `${debt.anticipatedInstallmentsCount}x consolidadas ${hasRemainingAfterAnticipation ? `· ${debt.remainingInstallments} restante(s)` : ''}`
                      : `${debt.elapsedInstallments}/${debt.installmentsCount}x`}
                  </span>
                </>
              )}
            </div>

            {debt.installmentsCount > 1 && (
              <div className="flex items-center gap-2 mt-1">
                {isAnticipated ? (
                  <div className="h-1 w-24 rounded-full bg-amber-200 dark:bg-amber-900 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 dark:bg-amber-400"
                      style={{
                        width: hasRemainingAfterAnticipation
                          ? `${((debt.anticipatedInstallmentsCount ?? 0) * 100) / debt.installmentsCount}%`
                          : '100%',
                      }}
                    />
                  </div>
                ) : (
                  <Progress className="h-1 w-24" value={progress} />
                )}
                <span className="text-xs text-muted-foreground">
                  {isAnticipated
                    ? hasRemainingAfterAnticipation
                      ? `${debt.anticipatedInstallmentsCount}x antecipadas`
                      : 'Parcelas consolidadas'
                    : debt.remainingInstallments > 0
                      ? `Falta(m) ${debt.remainingInstallments} parcela(s)`
                      : 'Última parcela'}
                </span>
              </div>
            )}
          </div>

          <div className="ml-auto flex flex-col text-right shrink-0">
            <p className="text-lg font-semibold">{formatPrice(totalMembersAmount)}</p>
            <span className="text-xs text-muted-foreground">
              Total: {formatPrice(fullDebtTotal)}
            </span>
            <div className="text-xs text-muted-foreground flex flex-col">
              {debt.members.length > 1
                ? debt.members.map(member => (
                    <span key={member.name}>
                      {member.name} ({formatPrice(member.installmentAmount / 100)})
                    </span>
                  ))
                : debt.members[0].name}
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="min-w-60">
          <ContextMenuGroup>
            <ContextMenuItem>
              <Pencil /> Editar
            </ContextMenuItem>
          </ContextMenuGroup>

          {!isComplete && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <UndoDot className="mr-2" /> Antecipar parcelas
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="min-w-20">
                {Array.from({ length: debt.remainingInstallments }, (_, i) => (
                  <ContextMenuItem key={i} onClick={() => onAnticipate(i + 1)}>
                    {i + 1}x
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}

          <ContextMenuSeparator />

          <ContextMenuItem
            variant="destructive"
            onSelect={event => {
              event.preventDefault()
              setDeleteOpen(true)
            }}
          >
            <Trash2 /> Excluir
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2 />
            </AlertDialogMedia>
            <AlertDialogTitle>Excluir despesa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá <strong>{debt.description}</strong> e todas as parcelas associadas
              permanentemente. Ela não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline">Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => onDelete(debt.debtId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
