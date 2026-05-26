import { HandCoins } from 'lucide-react'
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
import { CoverageForm } from '@/features/member-coverages/components/coverage-form'
import { CoveragesListContent } from '@/features/member-coverages/components/member-coverages-dialog-list'
import { useMemberCoverages } from '@/features/member-coverages/hooks/use-member-coverages'
import { creditCards } from '@/helpers/credit-cards'
import { isPastPeriod } from '@/lib/utils'

type MemberCoveragesDialogProps = {
  cardId: string
  cardName: string
  memberId: string
  targetYear: number
  targetMonth: number
  prefillAmountCents?: number
}

function CoveragesIndicator({
  memberId,
  cardId,
  targetMonth,
  targetYear,
}: Omit<MemberCoveragesDialogProps, 'cardName' | 'prefillAmountCents'>) {
  const { data } = useMemberCoverages({ memberId, cardId, targetMonth, targetYear })
  if (!data.coverages.length) return null
  const hasDebt = data.totalRemaining > 0
  return (
    <span
      className={`absolute top-1 right-1 size-1.5 rounded-full ${hasDebt ? 'bg-orange-500' : 'bg-green-500'}`}
    />
  )
}

export function MemberCoveragesDialog({
  cardId,
  memberId,
  cardName,
  targetMonth,
  targetYear,
  prefillAmountCents,
}: MemberCoveragesDialogProps) {
  const [open, setOpen] = useState(false)
  const isPast = isPastPeriod(targetMonth, targetYear)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 relative">
          <HandCoins className="size-4" />
          <Suspense fallback={null}>
            <CoveragesIndicator
              cardId={cardId}
              memberId={memberId}
              targetMonth={targetMonth}
              targetYear={targetYear}
            />
          </Suspense>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {creditCards.find(cc => cc.name.toLowerCase() === cardName.toLowerCase())?.icon({})}
            Coberturas - {cardName}
          </DialogTitle>
          <DialogDescription>
            Registre valores que você cobriu e acompanhe o retorno do membro.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="history">
          <TabsList className="w-full">
            <TabsTrigger
              value="add"
              disabled={isPast}
              className="flex-1 dark:data-[state=active]:bg-background dark:data-[state=active]:border-background"
            >
              Registrar
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 dark:data-[state=active]:bg-background dark:data-[state=active]:border-background"
            >
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-4">
            {isPast ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Coberturas só podem ser registradas para o mês atual ou futuros.
              </p>
            ) : (
              <CoverageForm
                cardId={cardId}
                memberId={memberId}
                targetYear={targetYear}
                targetMonth={targetMonth}
                prefillAmountCents={prefillAmountCents}
                onCancel={() => setOpen(false)}
                onSuccess={() => setOpen(false)}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
              <CoveragesListContent
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
