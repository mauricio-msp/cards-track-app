import { AlertTriangle, CheckCircle, Wallet } from 'lucide-react'
import { Suspense } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HiddenValue } from '@/components/ui/hidden-value'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useInvoicePaymentSummary } from '@/features/credit-card/hooks'
import { formatPrice, getInitialLetters } from '@/lib/utils'

function SummaryContent({ cardId }: { cardId: string }) {
  const { data } = useInvoicePaymentSummary(cardId)

  const totalAdvanced = data.members.reduce(
    (sum, m) =>
      sum + (data.isPastPeriod && m.isLate === null ? m.totalOwed : m.totalPaid),
    0,
  )
  const invoiceRemaining = Math.max(data.invoiceTotal - totalAdvanced, 0)

  return (
    <div className="space-y-3">
      {data.members.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum membro com parcelas neste período.
        </p>
      ) : (
        <div className="space-y-2">
          {data.members.map(member => (
            <div
              key={member.id}
              className="rounded-md border bg-muted/50 px-3 py-2.5 flex items-start gap-3"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {getInitialLetters(member.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{member.name}</span>

                  {member.isLate === true && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-amber-600 bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 border-amber-400 shrink-0"
                    >
                      <AlertTriangle className="size-3" />
                      Em atraso
                    </Badge>
                  )}

                  {member.isLate === false && (
                    <Badge
                      variant="outline"
                      className="gap-1 text-green-600 bg-green-100 dark:bg-green-950/20 dark:text-green-400 border-green-400 shrink-0"
                    >
                      <CheckCircle className="size-3" />
                      Em dia
                    </Badge>
                  )}
                </div>

                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>
                    Adiantou:{' '}
                    <HiddenValue placeholder="****">
                      <span className="text-foreground">
                        {formatPrice(
                          (data.isPastPeriod && member.isLate === null
                            ? member.totalOwed
                            : member.totalPaid) / 100,
                        )}
                      </span>
                    </HiddenValue>
                  </span>
                  <span>
                    Restante:{' '}
                    <HiddenValue placeholder="****">
                      <span
                        className={
                          member.isLate === true
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-foreground'
                        }
                      >
                        {formatPrice(
                          (data.isPastPeriod && member.isLate === null ? 0 : member.remaining) /
                            100,
                        )}
                      </span>
                    </HiddenValue>
                  </span>
                  {member.isLate !== null && (
                    <span>
                      Quitado?{' '}
                      <span
                        className={
                          member.isLate === false
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {member.isLate === false ? 'Sim' : 'Não'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <div className="grid grid-cols-3 divide-x border rounded-xl overflow-hidden">
        <div className="flex flex-col gap-0.5 px-3 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Fatura
          </span>
          <HiddenValue placeholder="****">
            <span className="font-semibold text-destructive">
              {formatPrice(data.invoiceTotal / 100)}
            </span>
          </HiddenValue>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Adiantado
          </span>
          <HiddenValue placeholder="****">
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatPrice(totalAdvanced / 100)}
            </span>
          </HiddenValue>
        </div>
        <div className="flex flex-col gap-0.5 px-3 py-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Restante
          </span>
          <HiddenValue placeholder="****">
            <span className="font-semibold text-foreground">
              {formatPrice(invoiceRemaining / 100)}
            </span>
          </HiddenValue>
        </div>
      </div>
    </div>
  )
}

function SummarySkeleton() {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {[0, 1].map(i => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
      <Separator />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

interface InvoicePaymentSummaryDialogProps {
  cardId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicePaymentSummaryDialog({
  cardId,
  open,
  onOpenChange,
}: InvoicePaymentSummaryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="items-center">
          <div className="rounded-full p-3 bg-blue-500/10 text-blue-700 dark:text-blue-400 w-fit mb-1">
            <Wallet className="size-5" />
          </div>
          <DialogTitle>Adiantamentos/pagamentos da Fatura</DialogTitle>
        </DialogHeader>

        <Suspense fallback={<SummarySkeleton />}>
          <SummaryContent cardId={cardId} />
        </Suspense>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
