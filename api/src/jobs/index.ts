import { schedule } from 'node-cron'
import { db } from '@/db'
import { ensureSubscriptionPurchases } from '@/jobs/ensure-subscription-purchases.job'

export function startJobs(log: {
  info: (msg: string) => void
  error: (msg: string, err?: unknown) => void
}) {
  // Run at 18:00 daily — generates subscription purchases for the current month
  schedule('0 18 * * *', async () => {
    log.info('[job] ensure-subscription-purchases: starting')
    try {
      await ensureSubscriptionPurchases(db)
      log.info('[job] ensure-subscription-purchases: completed')
    } catch (err) {
      log.error('[job] ensure-subscription-purchases: failed', err)
    }
  })

  log.info('[jobs] scheduled: ensure-subscription-purchases (daily 18:00)')
}
