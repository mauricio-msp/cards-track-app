import { Link, useParams } from '@tanstack/react-router'

import { ArrowLeft, PlusCircle } from 'lucide-react'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import { DebtsFilter, DebtsList, DebtsMembersList } from '@/features/credit-card/components/debts'
import {
  DebtsListSkeleton,
  DebtsMembersListSkeleton,
} from '@/features/credit-card/components/debts/skeleton'

import { Details } from '@/features/credit-card/components/details'
import { CreateDebtForm } from '@/features/credit-card/components/forms'
import { DetailsSkeleton, TotalAmountSkeleton } from '@/features/credit-card/components/skeleton'
import { TotalAmount } from '@/features/credit-card/components/total-amount'

export function Overview() {
  const { id } = useParams({ from: '/_app/credit-card/$id' })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" className="self-start cursor-pointer" asChild>
          <Link to="/dashboard">
            <ArrowLeft />
            Voltar para o dashboard
          </Link>
        </Button>

        <DebtsFilter />
      </div>

      <ScrollArea
        type="auto"
        className="-mx-4 sm:mx-0"
        viewportClassName="px-4 scroll-px-4 lg:px-0 lg:scroll-px-0 snap-x snap-mandatory lg:snap-none"
      >
        <div className="flex lg:grid lg:grid-cols-4 gap-4 pb-3 lg:pb-0">
          <div className="min-w-80 shrink-0 snap-start lg:col-span-3 *:h-full">
            <Suspense fallback={<DetailsSkeleton />}>
              <Details cardId={id} />
            </Suspense>
          </div>
          <div className="min-w-80 shrink-0 snap-start lg:col-span-1 *:h-full">
            <Suspense fallback={<TotalAmountSkeleton />}>
              <TotalAmount cardId={id} />
            </Suspense>
          </div>
        </div>
      </ScrollArea>

      <CreateDebtForm>
        <Button variant="outline" className="md:self-start my-3 cursor-pointer">
          <PlusCircle />
          Adicionar despesa
        </Button>
      </CreateDebtForm>

      <div className="flex-1 grid auto-rows-min gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <Suspense fallback={<DebtsListSkeleton />}>
          <DebtsList cardId={id} />
        </Suspense>
        <Suspense fallback={<DebtsMembersListSkeleton />}>
          <DebtsMembersList cardId={id} />
        </Suspense>
      </div>
    </div>
  )
}
