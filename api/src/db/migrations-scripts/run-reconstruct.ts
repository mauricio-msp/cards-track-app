import { db } from '@/db'
import { reconstructAnticipations } from './reconstruct-anticipations'

async function main() {
  const result = await reconstructAnticipations(db)
  console.log('reconstructed', result)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
