import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

import { FilterDebts } from '@/components/filter-debts'
import { MemberDebtsCard } from '@/components/members/member-debts-card'
import { MemberDetails } from '@/components/members/member-details'
import { MemberDebtsCardSkeleton } from '@/components/members/skeleton/member-debts-card-skeleton'
import { MemberDetailsSkeleton } from '@/components/members/skeleton/member-details-skeleton'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

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

        <FilterDebts />
      </div>

      <Suspense fallback={<MemberDetailsSkeleton />}>
        <MemberDetails memberId={id} />
      </Suspense>

      <Separator />

      <Suspense fallback={<MemberDebtsCardSkeleton />}>
        <MemberDebtsCard memberId={id} />
      </Suspense>
    </div>
  )
}
