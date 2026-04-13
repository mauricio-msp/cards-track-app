# Cards Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar os routes de cartões de `src/routes/credit-card/` para `src/modules/cards/`, replicando a arquitetura do módulo de membros (dto → errors → repository.interface → repository → service → controller → index).

**Architecture:** Separação de responsabilidades via injeção de dependência: o controller recebe o service, o service recebe o repository (via interface). A lógica de ownership e guards (hard delete) fica no service. As queries Drizzle ficam encapsuladas no repository.

**Tech Stack:** Fastify + fastify-type-provider-zod, Drizzle ORM, Zod, TypeScript.

---

## File Map

**Criar:**
- `src/modules/cards/cards.dto.ts` — Schemas Zod + tipos TypeScript
- `src/modules/cards/cards.errors.ts` — `CardNotFoundError`, `CardHasActiveDebtsError`
- `src/modules/cards/cards.repository.interface.ts` — Interface `ICardsRepository` + tipo `CardDebt`
- `src/modules/cards/cards.repository.ts` — Implementação Drizzle
- `src/modules/cards/cards.service.ts` — Regras de negócio
- `src/modules/cards/cards.controller.ts` — Todos os routes Fastify
- `src/modules/cards/index.ts` — Wiring de DI

**Modificar:**
- `src/app.ts` — Trocar `cardRoutes` por `cardsModule`

**Deletar:**
- `src/routes/credit-card/` (todos os arquivos)

---

## Task 1: cards.dto.ts

**Files:**
- Create: `src/modules/cards/cards.dto.ts`

- [ ] **Step 1: Criar o arquivo de DTOs**

```ts
import { createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { cards } from '@/db/schema'

export const createCardDto = z.object({
  name: z.string().min(3),
  limit: z.coerce.number().positive().describe('Limite total do cartão em centavos'),
  closingOffsetDays: z.coerce
    .number()
    .positive()
    .describe('Número de dias anteriores ao fechamento da fatura'),
  dueDay: z.coerce.number().positive().describe('Dia do fechamento da fatura'),
})

export const updateCardDto = z.object({
  limit: z.number().int().positive(),
  closingOffsetDays: z.number().int().min(1).max(31),
  dueDay: z.number().int().min(1).max(31),
})

export const getCardDebtsQueryDto = z.object({
  month: z.coerce.number().int().min(0).max(11).optional(),
  year: z.coerce.number().int().optional(),
})

export const cardSchema = createSelectSchema(cards)

export type CreateCardInput = z.infer<typeof createCardDto>
export type UpdateCardInput = z.infer<typeof updateCardDto>
export type GetCardDebtsQuery = z.infer<typeof getCardDebtsQueryDto>
export type Card = z.infer<typeof cardSchema>
```

---

## Task 2: cards.errors.ts

**Files:**
- Create: `src/modules/cards/cards.errors.ts`

- [ ] **Step 1: Criar as classes de erro**

```ts
export class CardNotFoundError extends Error {
  constructor() {
    super('Cartão não encontrado')
    this.name = 'CardNotFoundError'
  }
}

export class CardHasActiveDebtsError extends Error {
  constructor() {
    super(
      'Não é possível excluir um cartão com despesas ativas. Quite todas as parcelas antes de excluir.',
    )
    this.name = 'CardHasActiveDebtsError'
  }
}
```

---

## Task 3: cards.repository.interface.ts

**Files:**
- Create: `src/modules/cards/cards.repository.interface.ts`

- [ ] **Step 1: Criar a interface e o tipo `CardDebt`**

```ts
import type { Card, CreateCardInput, UpdateCardInput } from '@/modules/cards/cards.dto'

export type CardDebt = {
  debtId: string
  groupId: string
  description: string
  purchaseDate: string
  category: string | null
  totalAmount: number
  installmentsCount: number
  elapsedInstallments: number
  remainingInstallments: number
  anticipatedAt: string | null
  anticipatedInstallmentsCount: number | null
  anticipateFromInstallment: number | null
  subscriptionId: string | null
  members: Array<{
    id: string
    name: string
    relationship: string
    installmentAmount: number
  }>
}

export interface ICardsRepository {
  findById(id: string, userId: string): Promise<Card | null>
  findAll(userId: string): Promise<Pick<Card, 'id' | 'name' | 'limit' | 'closingOffsetDays' | 'dueDay'>[]>
  create(userId: string, data: CreateCardInput): Promise<Card>
  update(id: string, data: UpdateCardInput): Promise<void>
  delete(id: string): Promise<void>
  hasActiveInstallments(cardId: string): Promise<boolean>
  findDebts(
    cardId: string,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays'>,
    targetMonth: number,
    targetYear: number,
  ): Promise<CardDebt[]>
  findTotalAmountUsed(cardId: string, targetMonth: number, targetYear: number): Promise<number>
  findMonthTotalAmount(cardId: string, targetMonth: number, targetYear: number): Promise<number>
}
```

---

## Task 4: cards.repository.ts

**Files:**
- Create: `src/modules/cards/cards.repository.ts`

- [ ] **Step 1: Criar a implementação Drizzle**

```ts
import { and, eq, isNull, sql } from 'drizzle-orm'
import { uuidv7 } from 'uuidv7'
import type { db as Db } from '@/db'
import { cards, debts, installments, invoices, members, subscriptions } from '@/db/schema'
import { calculateInvoiceCompetence } from '@/utils/calculate-invoice-competence'
import type { Card, CreateCardInput, UpdateCardInput } from '@/modules/cards/cards.dto'
import type { CardDebt, ICardsRepository } from '@/modules/cards/cards.repository.interface'

export class CardsRepository implements ICardsRepository {
  constructor(private readonly db: typeof Db) {}

  async findById(id: string, userId: string): Promise<Card | null> {
    const [card] = await this.db
      .select()
      .from(cards)
      .where(and(eq(cards.id, id), eq(cards.ownerUserId, userId)))
      .limit(1)

    return card ?? null
  }

  async findAll(
    userId: string,
  ): Promise<Pick<Card, 'id' | 'name' | 'limit' | 'closingOffsetDays' | 'dueDay'>[]> {
    return this.db
      .select({
        id: cards.id,
        name: cards.name,
        limit: cards.limit,
        closingOffsetDays: cards.closingOffsetDays,
        dueDay: cards.dueDay,
      })
      .from(cards)
      .where(eq(cards.ownerUserId, userId))
  }

  async create(userId: string, data: CreateCardInput): Promise<Card> {
    const [card] = await this.db
      .insert(cards)
      .values({
        name: data.name,
        limit: data.limit,
        closingOffsetDays: data.closingOffsetDays,
        dueDay: data.dueDay,
        ownerUserId: userId,
      })
      .returning()

    return card
  }

  async update(id: string, data: UpdateCardInput): Promise<void> {
    await this.db
      .update(cards)
      .set({ limit: data.limit, closingOffsetDays: data.closingOffsetDays, dueDay: data.dueDay })
      .where(eq(cards.id, id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.id, id))
  }

  async hasActiveInstallments(cardId: string): Promise<boolean> {
    const [check] = await this.db
      .select({ id: installments.id })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .where(and(eq(invoices.cardId, cardId), isNull(installments.paidAt)))
      .limit(1)

    return !!check
  }

  async findDebts(
    cardId: string,
    card: Pick<Card, 'dueDay' | 'closingOffsetDays'>,
    targetMonth: number,
    targetYear: number,
  ): Promise<CardDebt[]> {
    // Auto-generate subscription debts for the queried period
    const activeSubscriptions = await this.db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.cardId, cardId), eq(subscriptions.active, true)))

    for (const sub of activeSubscriptions) {
      const actualMonth = targetMonth + 1
      const lastDayOfMonth = new Date(targetYear, actualMonth, 0).getDate()
      const day = Math.min(sub.billingDay, lastDayOfMonth)

      const purchaseDateStr = `${targetYear}-${String(actualMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const purchaseDate = new Date(`${purchaseDateStr}T00:00:00`)

      const { invoiceMonth, invoiceYear } = calculateInvoiceCompetence(
        purchaseDate,
        card.dueDay,
        card.closingOffsetDays,
      )

      if (invoiceMonth !== targetMonth || invoiceYear !== targetYear) continue

      const [existing] = await this.db
        .select({ id: debts.id })
        .from(debts)
        .where(
          and(
            eq(debts.subscriptionId, sub.id),
            eq(debts.invoiceMonth, invoiceMonth),
            eq(debts.invoiceYear, invoiceYear),
          ),
        )

      if (existing) continue

      let [invoice] = await this.db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.cardId, cardId),
            eq(invoices.month, invoiceMonth),
            eq(invoices.year, invoiceYear),
          ),
        )

      if (!invoice) {
        const dueDate = new Date(invoiceYear, invoiceMonth, card.dueDay)
        const [newInv] = await this.db
          .insert(invoices)
          .values({ cardId, month: invoiceMonth, year: invoiceYear, dueDate })
          .returning()
        invoice = newInv
      }

      const groupId = uuidv7()

      const [newDebt] = await this.db
        .insert(debts)
        .values({
          groupId,
          cardId,
          memberId: sub.memberId,
          invoiceId: invoice.id,
          description: sub.name,
          category: 'Assinatura',
          amount: sub.amount,
          installmentsCount: 1,
          installmentsAmount: sub.amount,
          purchaseDate: purchaseDateStr,
          invoiceMonth,
          invoiceYear,
          startInstallment: 1,
          endInstallment: 1,
          subscriptionId: sub.id,
        })
        .returning()

      await this.db.insert(installments).values({
        debtId: newDebt.id,
        memberId: sub.memberId,
        invoiceId: invoice.id,
        number: 1,
        amount: sub.amount,
      })
    }

    const rows = await this.db
      .select({
        debt: debts,
        member: members,
        installment: installments,
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(debts, eq(installments.debtId, debts.id))
      .innerJoin(members, eq(installments.memberId, members.id))
      .where(
        and(
          eq(invoices.cardId, cardId),
          eq(invoices.month, targetMonth),
          eq(invoices.year, targetYear),
        ),
      )

    const grouped = new Map<string, CardDebt>()

    for (const { installment, debt, member } of rows) {
      const currentInstallment = installment.number
      const start = debt.startInstallment
      const end = debt.endInstallment ?? debt.installmentsCount

      if (currentInstallment < start || currentInstallment > end) continue

      let group = grouped.get(debt.groupId)

      if (!group) {
        const anticipatedCount = debt.anticipatedAt
          ? debt.installmentsCount - currentInstallment + 1
          : 0

        const remainingInstallments = debt.anticipatedAt
          ? Math.max(debt.installmentsCount - (currentInstallment + anticipatedCount - 1), 0)
          : Math.max(debt.installmentsCount - currentInstallment, 0)

        group = {
          debtId: debt.id,
          groupId: debt.groupId,
          description: debt.description,
          purchaseDate: debt.purchaseDate,
          category: debt.category,
          totalAmount: 0,
          installmentsCount: debt.installmentsCount,
          elapsedInstallments: currentInstallment,
          remainingInstallments,
          anticipatedAt: debt.anticipatedAt?.toISOString() ?? null,
          anticipatedInstallmentsCount: debt.anticipatedAt
            ? debt.installmentsCount - currentInstallment + 1
            : null,
          anticipateFromInstallment: debt.anticipatedAt ? currentInstallment : null,
          subscriptionId: debt.subscriptionId ?? null,
          members: [],
        }
        grouped.set(debt.groupId, group)
      }

      const amount = Number(installment.amount)
      group.totalAmount += amount
      group.members.push({
        id: member.id,
        name: member.name,
        relationship: member.relationship,
        installmentAmount: amount,
      })
    }

    return Array.from(grouped.values()).filter(g => g.members.length > 0)
  }

  async findTotalAmountUsed(cardId: string, targetMonth: number, targetYear: number): Promise<number> {
    const [result] = await this.db
      .select({
        total: sql<number>`COALESCE(SUM(${installments.amount}), 0)`.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .where(
        and(
          eq(invoices.cardId, cardId),
          sql`(${invoices.year} > ${targetYear} OR (${invoices.year} = ${targetYear} AND ${invoices.month} >= ${targetMonth}))`,
        ),
      )

    return result?.total ?? 0
  }

  async findMonthTotalAmount(cardId: string, targetMonth: number, targetYear: number): Promise<number> {
    const [result] = await this.db
      .select({
        total: sql<number>`
          COALESCE(
            SUM(
              CASE
                WHEN ${installments.number} >= ${debts.startInstallment}
                  AND ${installments.number} <= COALESCE(${debts.endInstallment}, ${debts.installmentsCount})
                THEN ${installments.amount}
                ELSE 0
              END
            ),
            0
          )
        `.mapWith(Number),
      })
      .from(installments)
      .innerJoin(invoices, eq(installments.invoiceId, invoices.id))
      .innerJoin(debts, eq(installments.debtId, debts.id))
      .where(
        and(
          eq(invoices.cardId, cardId),
          eq(invoices.month, targetMonth),
          eq(invoices.year, targetYear),
        ),
      )

    return result?.total ?? 0
  }
}
```

---

## Task 5: cards.service.ts

**Files:**
- Create: `src/modules/cards/cards.service.ts`

- [ ] **Step 1: Criar o service**

```ts
import { resolveTargetPeriod } from '@/utils/resolve-target-period'
import type { Card, CreateCardInput, UpdateCardInput } from './cards.dto'
import { CardHasActiveDebtsError, CardNotFoundError } from './cards.errors'
import type { CardDebt, ICardsRepository } from './cards.repository.interface'

export class CardsService {
  constructor(private readonly repo: ICardsRepository) {}

  async create(userId: string, data: CreateCardInput): Promise<Card> {
    return this.repo.create(userId, data)
  }

  async findAll(userId: string) {
    return this.repo.findAll(userId)
  }

  async findById(id: string, userId: string): Promise<Card> {
    const card = await this.repo.findById(id, userId)
    if (!card) throw new CardNotFoundError()
    return card
  }

  async update(id: string, userId: string, data: UpdateCardInput): Promise<void> {
    await this.findById(id, userId)
    return this.repo.update(id, data)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findById(id, userId)
    const hasDebts = await this.repo.hasActiveInstallments(id)
    if (hasDebts) throw new CardHasActiveDebtsError()
    return this.repo.delete(id)
  }

  async getCardDebts(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<CardDebt[]> {
    const card = await this.findById(id, userId)
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)
    return this.repo.findDebts(id, card, targetMonth, targetYear)
  }

  async getTotalAmountUsed(id: string, userId: string): Promise<number> {
    const card = await this.findById(id, userId)
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay)
    return this.repo.findTotalAmountUsed(id, targetMonth, targetYear)
  }

  async getMonthTotalAmount(
    id: string,
    userId: string,
    month?: number,
    year?: number,
  ): Promise<{ total: number; targetMonth: number; targetYear: number }> {
    const card = await this.findById(id, userId)
    const { targetMonth, targetYear } = resolveTargetPeriod(card.dueDay, month, year)
    const total = await this.repo.findMonthTotalAmount(id, targetMonth, targetYear)
    return { total, targetMonth, targetYear }
  }
}
```

---

## Task 6: cards.controller.ts

**Files:**
- Create: `src/modules/cards/cards.controller.ts`

- [ ] **Step 1: Criar o controller com todos os routes**

```ts
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { cards } from '@/db/schema'
import { authMiddleware } from '@/middleware/auth'
import {
  cardSchema,
  createCardDto,
  getCardDebtsQueryDto,
  updateCardDto,
} from '@/modules/cards/cards.dto'
import { CardHasActiveDebtsError, CardNotFoundError } from '@/modules/cards/cards.errors'
import type { CardsService } from '@/modules/cards/cards.service'

export const cardsController =
  (service: CardsService): FastifyPluginAsyncZod =>
  async app => {
    // POST /api/cards
    app.post(
      '/api/cards',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Criar um novo cartão de crédito',
          description:
            'Cadastra um cartão definindo limite, dia de fechamento e dia de vencimento.',
          tags: ['Cards'],
          body: createCardDto,
          response: {
            201: z.object({ card: cardSchema, message: z.string() }),
            400: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const card = await service.create(request.user.id, request.body)
          return reply.status(201).send({ card, message: 'Cartão criado com sucesso!' })
        } catch (err) {
          request.log.error(err)
          return reply
            .status(400)
            .send({ message: 'Falha ao criar cartão. Verifique os dados e tente novamente.' })
        }
      },
    )

    // GET /api/cards
    app.get(
      '/api/cards',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Listar todos os cartões de crédito do usuário',
          description:
            'Retorna uma lista de todos os cartões cadastrados pelo usuário autenticado, incluindo informações de limite e datas de faturamento.',
          tags: ['Cards'],
          response: {
            200: z.object({
              cards: z.array(
                createSelectSchema(cards).omit({ createdAt: true, ownerUserId: true }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const rows = await service.findAll(request.user.id)
        return reply.status(200).send({ cards: rows })
      },
    )

    // GET /api/cards/:cardId
    app.get(
      '/api/cards/:cardId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter detalhes do cartão pelo ID',
          description:
            'Retorna as informações completas de um cartão de crédito específico pertencente ao usuário autenticado.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          response: {
            200: z.object({
              card: z.object({
                name: z.string(),
                limit: z.coerce.number(),
                dueDay: z.coerce.number(),
                closingOffsetDays: z.coerce.number(),
              }),
            }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const card = await service.findById(request.params.cardId, request.user.id)
          return reply.send({
            card: {
              name: card.name,
              limit: card.limit,
              dueDay: card.dueDay,
              closingOffsetDays: card.closingOffsetDays,
            },
          })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar o cartão' })
        }
      },
    )

    // PATCH /api/cards/:id
    app.patch(
      '/api/cards/:id',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Atualizar um cartão',
          tags: ['Cards'],
          params: z.object({ id: z.string() }),
          body: updateCardDto,
          response: {
            200: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          await service.update(request.params.id, request.user.id, request.body)
          return reply.send({ message: 'Cartão atualizado com sucesso' })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao atualizar o cartão' })
        }
      },
    )

    // DELETE /api/cards/:cardId
    app.delete(
      '/api/cards/:cardId',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Excluir um cartão',
          description:
            'Exclui um cartão somente se não houver parcelas pendentes (pagas ou não) em nenhuma fatura.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          response: {
            200: z.object({ message: z.string() }),
            400: z.object({ message: z.string() }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          await service.delete(request.params.cardId, request.user.id)
          return reply.send({ message: 'Cartão excluído com sucesso' })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          if (err instanceof CardHasActiveDebtsError) {
            return reply.status(400).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao excluir o cartão' })
        }
      },
    )

    // GET /api/cards/:cardId/debts
    app.get(
      '/api/cards/:cardId/debts',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter resumo de despesas do cartão por mês',
          description:
            'Lista todas as despesas vinculadas a um cartão em um mês específico, agrupando os membros responsáveis e detalhando o progresso das parcelas.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          querystring: getCardDebtsQueryDto,
          response: {
            200: z.object({
              debts: z.array(
                z.object({
                  debtId: z.string(),
                  groupId: z.string(),
                  description: z.string(),
                  purchaseDate: z.string(),
                  category: z.string().nullable(),
                  totalAmount: z.number(),
                  installmentsCount: z.number(),
                  elapsedInstallments: z.number(),
                  remainingInstallments: z.number(),
                  anticipatedAt: z.string().nullable(),
                  anticipatedInstallmentsCount: z.number().nullable(),
                  anticipateFromInstallment: z.number().nullable(),
                  subscriptionId: z.string().nullable(),
                  members: z.array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      relationship: z.string(),
                      installmentAmount: z.number(),
                    }),
                  ),
                }),
              ),
            }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { cardId } = request.params
          const { month, year } = request.query
          const cardDebts = await service.getCardDebts(cardId, request.user.id, month, year)
          return reply.send({ debts: cardDebts })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar despesas do cartão' })
        }
      },
    )

    // GET /api/cards/:cardId/total-amount-used
    app.get(
      '/api/cards/:cardId/total-amount-used',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter saldo total usado (parcelas futuras)',
          description:
            'Calcula a soma de todas as parcelas pendentes de um cartão, incluindo a fatura atual e todas as faturas futuras já registradas.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          response: {
            200: z.object({ totalAmountCard: z.number() }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const total = await service.getTotalAmountUsed(request.params.cardId, request.user.id)
          return reply.send({ totalAmountCard: total })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar total do cartão' })
        }
      },
    )

    // GET /api/cards/:cardId/month-total-amount
    app.get(
      '/api/cards/:cardId/month-total-amount',
      {
        preHandler: [authMiddleware],
        schema: {
          summary: 'Obter valor total da fatura para um mês específico',
          description:
            'Calcula a soma de todas as parcelas vinculadas à fatura de um cartão, respeitando o intervalo de responsabilidade de cada membro.',
          tags: ['Cards'],
          params: z.object({ cardId: z.string() }),
          querystring: z.object({
            month: z.coerce.number().int().min(0).max(11).optional(),
            year: z.coerce.number().int().optional(),
          }),
          response: {
            200: z.object({
              totalAmountMonth: z.number(),
              targetMonth: z.number(),
              targetYear: z.number(),
            }),
            404: z.object({ message: z.string() }),
          },
        },
      },
      async (request, reply) => {
        try {
          const { cardId } = request.params
          const { month, year } = request.query
          const result = await service.getMonthTotalAmount(cardId, request.user.id, month, year)
          return reply.send({
            totalAmountMonth: result.total,
            targetMonth: result.targetMonth,
            targetYear: result.targetYear,
          })
        } catch (err) {
          if (err instanceof CardNotFoundError) {
            return reply.status(404).send({ message: err.message })
          }
          request.log.error(err)
          return reply.status(500).send({ message: 'Falha ao buscar total mensal do cartão' })
        }
      },
    )
  }
```

---

## Task 7: cards/index.ts (DI wiring)

**Files:**
- Create: `src/modules/cards/index.ts`

- [ ] **Step 1: Criar o index com wiring de DI**

```ts
import { db } from '@/db'
import { cardsController } from '@/modules/cards/cards.controller'
import { CardsRepository } from '@/modules/cards/cards.repository'
import { CardsService } from '@/modules/cards/cards.service'

const repository = new CardsRepository(db)
const service = new CardsService(repository)

export const cardsModule = cardsController(service)
```

---

## Task 8: Atualizar app.ts

**Files:**
- Modify: `src/app.ts`

- [ ] **Step 1: Trocar `cardRoutes` por `cardsModule`**

Remover:
```ts
import { cardRoutes } from '@/routes/credit-card'
```

Adicionar:
```ts
import { cardsModule } from '@/modules/cards'
```

Trocar:
```ts
// Card
app.register(cardRoutes)
```

Por:
```ts
// Cards
app.register(cardsModule)
```

---

## Task 9: Deletar os routes antigos

**Files:**
- Delete: `src/routes/credit-card/` (todos os arquivos)

- [ ] **Step 1: Remover a pasta inteira**

```bash
rm -rf src/routes/credit-card
```

Verificar se a pasta `src/routes/` ainda é usada por outros módulos (debts, installments, subscriptions) — ela deve permanecer, apenas `credit-card/` é removida.

---

## Task 10: Verificar compilação e comportamento

- [ ] **Step 1: Verificar se o TypeScript compila sem erros**

```bash
npx tsc --noEmit
```

Expected: sem erros.

- [ ] **Step 2: Subir o servidor em dev e verificar os endpoints**

```bash
npm run dev
```

Testar manualmente via `/docs` (Scalar) ou cURL:
- `POST /api/cards` — criar cartão
- `GET /api/cards` — listar cartões
- `GET /api/cards/:cardId` — buscar por ID
- `PATCH /api/cards/:id` — atualizar
- `DELETE /api/cards/:cardId` — deletar (sem parcelas ativas → 200; com parcelas → 400)
- `GET /api/cards/:cardId/debts` — despesas do mês
- `GET /api/cards/:cardId/total-amount-used` — total usado
- `GET /api/cards/:cardId/month-total-amount` — total do mês
