import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { db } from '@/db'
import { cards, debts } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import { generateInstallmentCompetences } from '@/utils/generate-installment-competences'

type DebtChartDataEntry = {
  date: string // Format "YYYY-MM"
  [cardName: string]: number | string // O nome do cartão será a chave, e o valor será o total gasto naquele mês
}

export const getDebtsYearlyEvolution: FastifyPluginAsyncZod = async app => {
  app.get(
    '/api/debts/yearly-evolution',
    {
      preHandler: [authMiddleware],
      schema: {
        summary: 'Get monthly spending evolution per credit card',
        tags: ['Charts'],
        querystring: z.object({
          year: z.coerce.number().int().optional(),
        }),
        response: {
          200: z.object({
            chartData: z.array(
              // Usamos record para aceitar chaves de nomes de cartões que variam
              z.record(z.string(), z.union([z.string(), z.number()])),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user
      const targetYear = request.query.year ?? new Date().getFullYear()

      // 1. Buscamos os débitos
      const rows = await db
        .select({
          debt: {
            invoiceMonth: debts.invoiceMonth,
            invoiceYear: debts.invoiceYear,
            installmentsCount: debts.installmentsCount,
            installmentsAmount: debts.installmentsAmount,
            startInstallment: debts.startInstallment,
            endInstallment: debts.endInstallment,
          },
          card: {
            name: cards.name,
          },
        })
        .from(debts)
        .innerJoin(cards, eq(debts.cardId, cards.id))
        .where(eq(cards.ownerUserId, userId))

      // 2. Identificamos todos os nomes de cartões únicos para "zerar" o gráfico
      const uniqueCardNames = Array.from(new Set(rows.map(r => r.card.name.toLowerCase())))

      // 3. Criamos a estrutura para os 12 meses
      const result = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i
        const dateLabel = `${targetYear}-${String(i + 1).padStart(2, '0')}`

        // Inicializa o objeto do mês com a data e todos os cartões com valor 0
        const entry: DebtChartDataEntry = { date: dateLabel }
        uniqueCardNames.forEach(name => {
          entry[name] = 0
        })

        // 4. Soma os débitos que pertencem a este mês/ano
        rows.forEach(({ debt, card }) => {
          const competences = generateInstallmentCompetences(
            debt.invoiceMonth,
            debt.invoiceYear,
            debt.installmentsCount,
          )

          // Procura se existe uma parcela deste débito neste mês/ano específico
          const parcelIdx = competences.findIndex(
            c => c.month === monthIndex && c.year === targetYear,
          )

          if (parcelIdx !== -1) {
            const currentParcelNum = parcelIdx + 1
            const start = debt.startInstallment ?? 1
            const end = debt.endInstallment ?? debt.installmentsCount

            // Verifica se a parcela está no intervalo de quem paga
            if (currentParcelNum >= start && currentParcelNum <= end) {
              const cardName = card.name.toLowerCase()
              entry[cardName] = Number(
                (Number(entry[cardName] ?? 0) + Number(debt.installmentsAmount)).toFixed(2),
              )
            }
          }
        })

        return entry
      })

      return reply.status(200).send({
        chartData: result.map(({ date, ...entry }) => ({
          date,
          ...entry,
        })),
      })
    },
  )
}
