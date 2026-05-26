import { BanknoteX, Check, HandCoins, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ActionAlertDialog } from '@/components/action-alert-dialog'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { HiddenValue } from '@/components/ui/hidden-value'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import type { MemberCoverage } from '@/features/member-coverages/api/get-member-coverages'
import {
  centsToBRLMask,
  parseBRLToCents,
} from '@/features/member-coverages/hooks/forms/use-member-coverage-form'
import { useDeleteMemberCoverage } from '@/features/member-coverages/hooks/use-delete-member-coverage'
import { useUpdateCoverageRepayment } from '@/features/member-coverages/hooks/use-update-coverage-repayment'
import { formatPrice } from '@/lib/utils'

type CoveragesListProps = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  coverages: MemberCoverage[]
  totalCovered: number
  totalRepaid: number
  totalRemaining: number
}

function CoverageItem({
  coverage,
  memberId,
  cardId,
  targetMonth,
  targetYear,
}: {
  coverage: MemberCoverage
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [partialValue, setPartialValue] = useState(
    coverage.amountRepaid > 0 ? centsToBRLMask(coverage.amountRepaid) : '',
  )

  const { mutate: deleteCoverage, isPending: isDeleting } = useDeleteMemberCoverage({
    memberId,
    cardId,
    targetMonth,
    targetYear,
  })

  const { mutate: updateRepayment, isPending: isUpdating } = useUpdateCoverageRepayment({
    memberId,
    cardId,
    targetMonth,
    targetYear,
  })

  const isSettled = !!coverage.settledAt

  function handleSettledToggle(checked: boolean) {
    updateRepayment({
      memberId,
      cardId,
      coverageId: coverage.id,
      settled: checked,
      amountRepaid: checked ? undefined : 0,
    })
  }

  function handlePartialSave() {
    const cents = parseBRLToCents(partialValue)
    updateRepayment({
      memberId,
      cardId,
      coverageId: coverage.id,
      amountRepaid: cents,
      settled: false,
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-2.5 px-2 rounded-lg border border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="shrink-0 size-9 rounded-lg bg-muted flex items-center justify-center border border-border">
            <HandCoins className="size-4 text-orange-500 dark:text-orange-400" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex flex-col">
              <span className="text-md font-semibold">{formatPrice(coverage.amount / 100)}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(coverage.coveredAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive shrink-0"
            onClick={() => setDeleteOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        {coverage.description && (
          <span className="text-xs text-muted-foreground wrap-break-word">
            OBS: {coverage.description}
          </span>
        )}

        <div className="flex flex-col gap-3">
          {!isSettled && (
            <CurrencyInput
              value={partialValue}
              onChange={e => setPartialValue(e.target.value)}
              className="text-xs"
              placeholder="0,00"
            />
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={isSettled}
                onCheckedChange={handleSettledToggle}
                disabled={isUpdating}
                id={`settled-${coverage.id}`}
              />
              <label
                htmlFor={`settled-${coverage.id}`}
                className="text-xs text-muted-foreground cursor-pointer select-none"
              >
                {isSettled ? 'Quitado' : 'Quitado?'}
              </label>
              {isSettled && <Check className="size-3.5 text-green-500" />}
            </div>

            {!isSettled && (
              <Button
                size="sm"
                type="button"
                className="h-7 text-xs px-2"
                disabled={isUpdating || !partialValue}
                onClick={handlePartialSave}
              >
                <Save />
                Salvar
              </Button>
            )}
          </div>
        </div>

        {!isSettled && coverage.amountRepaid > 0 && (
          <div className="flex justify-between pl-11 text-xs text-muted-foreground">
            <span>Recebido: {formatPrice(coverage.amountRepaid / 100)}</span>
            <span className="text-destructive font-medium">
              Deve: {formatPrice(coverage.remaining / 100)}
            </span>
          </div>
        )}
      </div>

      <ActionAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        icon={<Trash2 />}
        intent="destructive"
        title="Remover cobertura?"
        content={
          <p>
            Esta ação não pode ser desfeita. A cobertura de{' '}
            <strong>{formatPrice(coverage.amount / 100)}</strong> será removida permanentemente.
          </p>
        }
        isLoading={isDeleting}
        actionLabel="Remover"
        onConfirm={() => deleteCoverage({ memberId, cardId, coverageId: coverage.id })}
      />
    </>
  )
}

export function CoveragesList({
  memberId,
  cardId,
  targetMonth,
  targetYear,
  coverages,
  totalCovered,
  totalRepaid,
  totalRemaining,
}: CoveragesListProps) {
  if (coverages.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BanknoteX />
          </EmptyMedia>
          <EmptyTitle>Nenhuma cobertura</EmptyTitle>
          <EmptyDescription>Nenhuma cobertura registrada para esta fatura.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2">
        {coverages.map(coverage => (
          <CoverageItem
            key={coverage.id}
            coverage={coverage}
            memberId={memberId}
            cardId={cardId}
            targetMonth={targetMonth}
            targetYear={targetYear}
          />
        ))}
      </div>

      <Separator className="my-3" />

      <div className="grid grid-cols-3 divide-x border rounded-xl overflow-hidden">
        <div className="flex flex-col gap-0.5 px-3 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Coberto
          </span>
          <HiddenValue placeholder="****">
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {formatPrice(totalCovered / 100)}
            </span>
          </HiddenValue>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recebido
          </span>
          <HiddenValue placeholder="****">
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatPrice(totalRepaid / 100)}
            </span>
          </HiddenValue>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Deve
          </span>
          <HiddenValue placeholder="****">
            <span className="font-semibold text-destructive">
              {formatPrice(totalRemaining / 100)}
            </span>
          </HiddenValue>
        </div>
      </div>
    </div>
  )
}
