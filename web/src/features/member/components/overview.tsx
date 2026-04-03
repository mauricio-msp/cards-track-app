import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { DebtsFilter } from '@/features/credit-card/components/debts'
import { DebtsByCard } from '@/features/member/components/debts-by-card'
import { Details } from '@/features/member/components/details'
import { DebtsByCardSkeleton, DetailsSkeleton } from '@/features/member/components/skeleton'

export function MemberOverview() {
  const { id } = useParams({ from: '/_app/members/$id' })

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" className="self-start cursor-pointer" asChild>
          <Link to="/dashboard">
            <ArrowLeft />
            Back to dashboard
          </Link>
        </Button>

        <DebtsFilter />
      </div>

      <Suspense fallback={<DetailsSkeleton />}>
        <Details memberId={id} />
      </Suspense>

      <Separator />

      <Suspense fallback={<DebtsByCardSkeleton />}>
        <DebtsByCard memberId={id} />
      </Suspense>
    </div>
  )
}
