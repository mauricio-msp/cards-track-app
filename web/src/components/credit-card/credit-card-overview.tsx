import { Link, useParams } from '@tanstack/react-router'

import { ArrowLeft, PlusCircle } from 'lucide-react'
import { Suspense } from 'react'

import { CreditCardDebtsList } from '@/components/credit-card/credit-card-debts-list'
import { CreditCardDebtsMembersList } from '@/components/credit-card/credit-card-debts-members-list'
import { CreditCardDetails } from '@/components/credit-card/credit-card-details'
import { CreditCardTotalAmount } from '@/components/credit-card/credit-card-total-amount'
import { CreditCardDebtsListSkeleton } from '@/components/credit-card/skeleton/credit-card-debts-list-skeleton'
import { CreditCardDebtsMembersListSkeleton } from '@/components/credit-card/skeleton/credit-card-debts-members-list-skeleton'
import { CreditCardDetailsSkeleton } from '@/components/credit-card/skeleton/credit-card-details-skeleton'
import { CreditCardTotalAmountSkeleton } from '@/components/credit-card/skeleton/credit-card-total-amount-skeleton'
import { FilterDebts } from '@/components/filter-debts'
import { CreateDebtForm } from '@/components/forms/create-debt-form'
import { Button } from '@/components/ui/button'

export function CreditCardOverview() {
  const { id } = useParams({ from: '/_app/credit-card/$id' })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" className="self-start cursor-pointer" asChild>
          <Link to="/dashboard">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>

        <FilterDebts />
      </div>

      <div className="grid auto-rows-min gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <Suspense fallback={<CreditCardDetailsSkeleton />}>
          <CreditCardDetails cardId={id} />
        </Suspense>
        <Suspense fallback={<CreditCardTotalAmountSkeleton />}>
          <CreditCardTotalAmount cardId={id} />
        </Suspense>
      </div>

      <CreateDebtForm>
        <Button variant="outline" className="self-start my-3 cursor-pointer">
          <PlusCircle />
          New debt
        </Button>
      </CreateDebtForm>

      <div className="flex-1 grid auto-rows-min gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
        <Suspense fallback={<CreditCardDebtsListSkeleton />}>
          <CreditCardDebtsList cardId={id} />
        </Suspense>
        <Suspense fallback={<CreditCardDebtsMembersListSkeleton />}>
          <CreditCardDebtsMembersList cardId={id} />
        </Suspense>
      </div>
    </div>
  )
}
