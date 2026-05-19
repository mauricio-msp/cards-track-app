import { BanknoteX, Pencil, Trash2, Wallet } from 'lucide-react'
import { useState } from 'react'
import { ActionAlertDialog } from '@/components/action-alert-dialog'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { HiddenValue } from '@/components/ui/hidden-value'
import { Separator } from '@/components/ui/separator'
import type { MemberPayment } from '@/features/member-payments/api/get-member-payments'
import { PaymentForm } from '@/features/member-payments/components/payment-form'
import { useDeleteMemberPayment } from '@/features/member-payments/hooks/use-delete-member-payment'
import { formatPrice } from '@/lib/utils'

type PaymentsListProps = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
  payments: MemberPayment[]
  totalPaid: number
  remaining: number
}

function PaymentItem({
  payment,
  memberId,
  cardId,
  targetMonth,
  targetYear,
}: {
  payment: MemberPayment
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { mutate: deletePayment, isPending: isDeleting } = useDeleteMemberPayment({
    memberId,
    cardId,
    targetMonth,
    targetYear,
  })

  if (isEditing) {
    return (
      <div className="py-3 px-3 border rounded-lg bg-muted/30 my-1">
        <p className="text-xs text-muted-foreground mb-3">
          Original:{' '}
          <span className="font-medium text-foreground">{formatPrice(payment.amount / 100)}</span>
          {' · '}
          {new Date(payment.paidAt).toLocaleDateString('pt-BR', {
            timeZone: 'UTC',
          })}
        </p>
        <PaymentForm
          memberId={memberId}
          cardId={cardId}
          targetMonth={targetMonth}
          targetYear={targetYear}
          editingPaymentId={payment.id}
          editingAmountCents={payment.amount}
          editingPaidAt={payment.paidAt}
          editingDescription={payment.description}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <>
      <div className="group flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-muted/50 hover:border hover:border-border border border-transparent transition-colors">
        <div className="shrink-0 size-9 rounded-lg bg-muted flex items-center justify-center border border-border">
          <Wallet className="size-4 text-green-500 dark:text-green-400" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{formatPrice(payment.amount / 100)}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(payment.paidAt).toLocaleDateString('pt-BR', {
                timeZone: 'UTC',
              })}
            </span>
          </div>
          <span className="text-xs text-muted-foreground wrap-break-word">
            {payment.description}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => setIsEditing(true)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <ActionAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        icon={<Trash2 />}
        intent="destructive"
        title="Remover pagamento?"
        content={
          <p>
            Esta ação não pode ser desfeita. O pagamento de{' '}
            <strong>{formatPrice(payment.amount / 100)}</strong> será removido permanentemente.
          </p>
        }
        isLoading={isDeleting}
        actionLabel="Remover"
        onConfirm={() => deletePayment({ memberId, cardId, paymentId: payment.id })}
      />
    </>
  )
}

export function PaymentsList({
  memberId,
  cardId,
  targetMonth,
  targetYear,
  payments,
  totalPaid,
  remaining,
}: PaymentsListProps) {
  if (payments.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BanknoteX />
          </EmptyMedia>
          <EmptyTitle>Nenhum pagamento</EmptyTitle>
          <EmptyDescription>Nenhum adiantamento registrado para esta fatura.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-0.5">
        {payments.map(payment => (
          <PaymentItem
            key={payment.id}
            payment={payment}
            memberId={memberId}
            cardId={cardId}
            targetMonth={targetMonth}
            targetYear={targetYear}
          />
        ))}
      </div>

      <Separator className="my-3" />

      <div className="grid grid-cols-2 divide-x border rounded-xl overflow-hidden">
        <div className="flex flex-col gap-0.5 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total pago
          </span>
          <HiddenValue placeholder="****">
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatPrice(totalPaid / 100)}
            </span>
          </HiddenValue>
        </div>
        <div className="flex flex-col gap-0.5 px-4 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Restante
          </span>
          <HiddenValue placeholder="****">
            <span className="font-semibold text-destructive">{formatPrice(remaining / 100)}</span>
          </HiddenValue>
        </div>
      </div>
    </div>
  )
}
