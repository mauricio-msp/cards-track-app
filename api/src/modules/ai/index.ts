import { db } from '@/db'
import { ChatUseCase } from '@/modules/ai/application/use-cases/chat/chat.use-case'
import { ParsePurchaseUseCase } from '@/modules/ai/application/use-cases/parse-purchase/parse-purchase.use-case'
import { ChatController } from '@/modules/ai/http/controllers/chat.controller'
import { ParsePurchaseController } from '@/modules/ai/http/controllers/parse-purchase.controller'
import { aiRoutes } from '@/modules/ai/http/routes'
import { ChatSnapshotRepository } from '@/modules/ai/infra/chat-snapshot.repository'

const snapshotRepo = new ChatSnapshotRepository(db)

const controllers = {
  parsePurchase: new ParsePurchaseController(new ParsePurchaseUseCase()),
  chat: new ChatController(new ChatUseCase(snapshotRepo)),
}

export const aiModule = aiRoutes(controllers)
