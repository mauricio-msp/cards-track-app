import { Suspense } from 'react'
import { CardsCard } from '@/features/settings/components/cards-card'
import { MembersCard } from '@/features/settings/components/members-card'
import { PreferencesCard } from '@/features/settings/components/preferences-card'
import { ProfileCard } from '@/features/settings/components/profile-card'
import { SettingsHeader } from '@/features/settings/components/settings-header'
import {
  CardsCardSkeleton,
  MembersCardSkeleton,
  SettingsHeaderSkeleton,
} from '@/features/settings/components/skeleton'
import { SubscriptionsCard } from '@/features/settings/components/subscriptions-card'

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">
      <Suspense fallback={<SettingsHeaderSkeleton />}>
        <SettingsHeader />
      </Suspense>
      <ProfileCard />
      <Suspense fallback={<CardsCardSkeleton />}>
        <CardsCard />
      </Suspense>
      <Suspense fallback={<MembersCardSkeleton />}>
        <MembersCard />
      </Suspense>
      <Suspense fallback={<div className="h-32 rounded-lg border bg-muted/30 animate-pulse" />}>
        <SubscriptionsCard />
      </Suspense>
      <PreferencesCard />
    </div>
  )
}
