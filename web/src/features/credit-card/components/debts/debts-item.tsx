import type { LucideIcon } from 'lucide-react'
import {
  CreditCard,
  Dot,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
  TriangleAlert,
  UndoDot,
  Zap,
} from 'lucide-react'
import React from 'react'
import type { z } from 'zod'
import { AnticipateAlertDialog } from '@/components/anticipate-alert-dialog'
import { DeleteAlertDialog } from '@/components/delete-alert-dialog'
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
import { HiddenValue } from '@/components/ui/hidden-value'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { GetCardDebtsItem } from '@/features/credit-card/api/get-card-debts'
import { cn, formatPrice } from '@/lib/utils'

type Debt = z.infer<typeof GetCardDebtsItem>

interface DebtsItemProps {
  debt: Debt
  onAnticipate: (installments: number) => Promise<unknown>
  onDelete: (debtId: string) => void
}

type StatusBadge = {
  show: boolean
  className: string
  icon: LucideIcon
  label: string
}

export function DebtsItem({ debt, onAnticipate, onDelete }: DebtsItemProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [anticipateOpen, setAnticipateOpen] = React.useState(false)
  const [anticipatingCount, setAnticipaingCount] = React.useState(0)
  const [isAnticipating, setIsAnticipating] = React.useState(false)

  async function handleConfirmAnticipate() {
    setIsAnticipating(true)
    try {
      await onAnticipate(anticipatingCount)
      setAnticipateOpen(false)
    } finally {
      setIsAnticipating(false)
    }
  }

  function handleSelectAnticipate(count: number) {
    setAnticipaingCount(count)
    setAnticipateOpen(true)
  }

  const isAnticipated =
    !!debt.anticipatedAt && debt.elapsedInstallments === debt.anticipateFromInstallment

  const isComplete = debt.remainingInstallments === 0

  const progress = (debt.elapsedInstallments * 100) / debt.installmentsCount

  const hasRemainingAfterAnticipation = isAnticipated && debt.remainingInstallments > 0

  const isNewPurchase =
    !isAnticipated && debt.installmentsCount > 1 && debt.elapsedInstallments === 1

  const isLastPayment = isComplete && !isAnticipated && !debt.subscriptionId

  const totalMembersAmount = debt.members.reduce(
    (sum: number, member) => sum + member.installmentAmount / 100,
    0,
  )

  const perInstallmentTotal = debt.members.reduce(
    (sum: number, member) => sum + member.perInstallmentAmount / 100,
    0,
  )

  const fullDebtTotal = perInstallmentTotal * debt.installmentsCount

  const statusBadges: StatusBadge[] = [
    {
      show: isAnticipated,
      icon: Zap,
      label: hasRemainingAfterAnticipation ? 'Parcial' : 'Antecipado',
      className: 'gap-1 text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      show: !!debt.subscriptionId,
      icon: RefreshCw,
      label: 'Recorrente',
      className: 'gap-1 text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      show: isNewPurchase,
      icon: Sparkles,
      label: 'Nova',
      className: 'gap-1 text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
    },
    {
      show: isLastPayment,
      icon: TriangleAlert,
      label: 'Último',
      className: 'gap-1 text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400',
    },
  ]

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          disabled={isComplete}
          data-complete={isComplete}
          className={cn(
            'py-4 bg-muted/30 rounded-xl border flex flex-wrap gap-x-4 gap-y-2 px-2',
            'sm:flex-nowrap sm:gap-4 sm:rounded-none sm:border-0 sm:bg-transparent sm:not-last:border-b sm:rounded-t-lg',
            'data-[complete=true]:cursor-default data-[complete=false]:cursor-context-menu',
          )}
        >
          <div className="size-10 bg-muted/50 rounded-lg grid place-items-center shrink-0">
            <CreditCard className="size-4 text-muted-foreground" />
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-lg text-primary truncate">{debt.description}</p>
              {statusBadges
                .filter(b => b.show)
                .map(({ className, icon: Icon, label }) => (
                  <Badge key={label} variant="outline" className={className}>
                    <Icon className="size-3" />
                    {label}
                  </Badge>
                ))}
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

          <Separator className="sm:hidden" />

          <div className="w-full flex justify-between items-start sm:items-end sm:w-auto sm:ml-auto sm:flex-col sm:text-right sm:shrink-0">
            <div className="text-xs text-muted-foreground flex flex-col sm:order-last">
              {debt.members.length > 1
                ? debt.members.map(member => (
                    <span key={member.name}>
                      {member.name} (
                      <HiddenValue placeholder="****">
                        {formatPrice(member.installmentAmount / 100)}
                      </HiddenValue>
                      )
                    </span>
                  ))
                : debt.members[0].name}
            </div>
            <div className="flex flex-col items-end sm:order-first">
              <HiddenValue className="w-24 h-7 mb-0.5">
                <p className="text-lg font-semibold">{formatPrice(totalMembersAmount)}</p>
              </HiddenValue>
              <span className="text-xs text-muted-foreground">
                Total: <HiddenValue placeholder="****">{formatPrice(fullDebtTotal)}</HiddenValue>
              </span>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="min-w-60">
          <ContextMenuGroup>
            <ContextMenuItem>
              <Pencil /> Editar
            </ContextMenuItem>
          </ContextMenuGroup>

          {!isComplete && debt.anticipatableInstallments > 0 && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <UndoDot className="mr-2" /> Antecipar parcelas
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="min-w-20">
                {Array.from({ length: debt.anticipatableInstallments }, (_, i) => (
                  <ContextMenuItem
                    key={i}
                    onSelect={e => {
                      e.preventDefault()
                      handleSelectAnticipate(i + 1)
                    }}
                  >
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

      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir despesa?"
        description={
          <div className="space-y-2">
            <p>Esta ação removerá</p>
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-foreground">
              <p className="font-medium">{debt.description}</p>
              <p className="text-xs text-muted-foreground">
                {debt.members.map(m => m.name).join(', ')} · {formatPrice(fullDebtTotal)}
              </p>
            </div>
            <p>e todas as parcelas associadas permanentemente. Ela não pode ser desfeita.</p>
          </div>
        }
        onConfirm={() => onDelete(debt.debtId)}
      />

      <AnticipateAlertDialog
        open={anticipateOpen}
        onOpenChange={setAnticipateOpen}
        isLoading={isAnticipating}
        title="Antecipar parcelas?"
        description={
          <div className="space-y-2">
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-foreground">
              <p className="font-medium">{debt.description}</p>
              <p className="text-xs text-muted-foreground">
                {anticipatingCount}x parcela(s) · {formatPrice(perInstallmentTotal * anticipatingCount)}
              </p>
            </div>
            <p>As parcelas serão consolidadas em um único valor. Esta ação não pode ser desfeita.</p>
          </div>
        }
        onConfirm={handleConfirmAnticipate}
      />
    </>
  )
}
