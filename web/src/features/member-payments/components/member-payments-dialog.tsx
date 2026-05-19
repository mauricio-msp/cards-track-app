import { NotebookText } from 'lucide-react'
import { Suspense, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaymentsListContent } from '@/features/member-payments/components/member-payments-dialog-list'
import { PaymentForm } from '@/features/member-payments/components/payment-form'
import { useMemberPayments } from '@/features/member-payments/hooks/use-member-payments'
import { creditCards } from '@/helpers/credit-cards'

type MemberPaymentsDialogProps = {
  cardId: string
  cardName: string
  memberId: string
  targetYear: number
  targetMonth: number
}

function PaymentsIndicator({
  memberId,
  cardId,
  targetMonth,
  targetYear,
}: Omit<MemberPaymentsDialogProps, 'cardName'>) {
  const { data } = useMemberPayments({ memberId, cardId, targetMonth, targetYear })
  if (!data.payments.length) return null
  return <span className="absolute top-1 right-1 size-1.5 rounded-full bg-green-500" />
}

export function MemberPaymentsDialog({
  cardId,
  memberId,
  cardName,
  targetMonth,
  targetYear,
}: MemberPaymentsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 relative">
          <NotebookText className="size-4" />
          <Suspense fallback={null}>
            <PaymentsIndicator
              cardId={cardId}
              memberId={memberId}
              targetMonth={targetMonth}
              targetYear={targetYear}
            />
          </Suspense>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {creditCards.find(cc => cc.name.toLowerCase() === cardName.toLowerCase())?.icon({})}
            Adiantamentos - {cardName}
          </DialogTitle>
          <DialogDescription>
            Registre valores entregues para descontar da fatura.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="history">
          <TabsList className="w-full">
            <TabsTrigger
              value="add"
              className="flex-1 dark:data-[state=active]:bg-background dark:data-[state=active]:border-background"
            >
              Adicionar
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 dark:data-[state=active]:bg-background dark:data-[state=active]:border-background"
            >
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-4">
            <PaymentForm
              cardId={cardId}
              memberId={memberId}
              targetYear={targetYear}
              targetMonth={targetMonth}
              onCancel={() => setOpen(false)}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
              <PaymentsListContent
                cardId={cardId}
                memberId={memberId}
                targetYear={targetYear}
                targetMonth={targetMonth}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
