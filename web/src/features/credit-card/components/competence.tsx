import { Landmark } from 'lucide-react'

import { creditCards } from '@/helpers/credit-cards'
import { MONTHS } from '@/helpers/months'

export function Competence({
  cardName,
  targetMonth,
  targetYear,
}: {
  cardName: string
  targetMonth: number
  targetYear: number
}) {
  const currentCreditCard = creditCards.find(cc => cc.name.toLowerCase() === cardName)

  return (
    <>
      {currentCreditCard?.icon({
        className: 'size-12 rounded-xl grid place-items-center',
        children: <Landmark className="text-primary" />,
      })}

      <div className="flex flex-col gap-0.5">
        <p className="text-lg font-semibold">{currentCreditCard?.name}</p>
        <span className="text-sm text-muted-foreground">
          Competência: {MONTHS[targetMonth]}/{targetYear}
        </span>
      </div>
    </>
  )
}
