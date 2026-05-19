import { PaymentsList } from '@/features/member-payments/components/payments-list'
import { useMemberPayments } from '@/features/member-payments/hooks/use-member-payments'

type PaymentsListContentProps = {
  memberId: string
  cardId: string
  targetMonth: number
  targetYear: number
}

export function PaymentsListContent({
  memberId,
  cardId,
  targetMonth,
  targetYear,
}: PaymentsListContentProps) {
  const { data } = useMemberPayments({
    memberId,
    cardId,
    targetMonth,
    targetYear,
  })

  return (
    <PaymentsList
      cardId={cardId}
      memberId={memberId}
      targetYear={targetYear}
      targetMonth={targetMonth}
      payments={data.payments}
      totalPaid={data.totalPaid}
      remaining={data.remaining}
    />
  )
}
