import { ParsePurchaseUseCase } from '@/modules/ai/application/use-cases/parse-purchase/parse-purchase.use-case'
import { ParsePurchaseController } from '@/modules/ai/http/controllers/parse-purchase.controller'
import { aiRoutes } from '@/modules/ai/http/routes'

const controllers = {
  parsePurchase: new ParsePurchaseController(new ParsePurchaseUseCase()),
}

export const aiModule = aiRoutes(controllers)
