// api/src/modules/ai/application/use-cases/chat/chat.use-case.ts

import Groq from 'groq-sdk'
import { env } from '@/env'
import type { IChatSnapshotRepository, SnapshotPurchaseRow } from '@/modules/ai/domain/chat-snapshot.repository.interface'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export type ChatInput = {
  userId: string
  messages: ChatMessage[]
}

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const fmt = (cents: number) =>
  `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`

export class ChatUseCase {
  private readonly groq: Groq

  constructor(private readonly snapshotRepo: IChatSnapshotRepository) {
    this.groq = new Groq({ apiKey: env.GROQ_API_KEY })
  }

  async execute({ userId, messages }: ChatInput) {
    const now = new Date()
    const currentMonth = now.getMonth() // 0-11
    const currentYear = now.getFullYear()
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const [
      memberRows,
      cardRows,
      currentPurchaseRows,
      prevPurchaseRows,
      subscriptionRows,
      paymentRows,
      cardTotals,
    ] = await Promise.all([
      this.snapshotRepo.getMembers(userId),
      this.snapshotRepo.getCards(userId),
      this.snapshotRepo.getPurchaseRows(userId, currentMonth, currentYear),
      this.snapshotRepo.getPurchaseRows(userId, prevMonth, prevYear),
      this.snapshotRepo.getSubscriptions(userId),
      this.snapshotRepo.getPayments(userId, currentMonth, currentYear),
      this.snapshotRepo.getCardTotals(userId, currentMonth, currentYear),
    ])

    const systemPrompt = this.buildSystemPrompt({
      now,
      memberRows,
      cardRows,
      currentPurchaseRows,
      prevPurchaseRows,
      subscriptionRows,
      paymentRows,
      cardTotals,
      currentMonth,
      currentYear,
      prevMonth,
      prevYear,
    })

    return this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    })
  }

  private buildSystemPrompt({
    now,
    memberRows,
    cardRows,
    currentPurchaseRows,
    prevPurchaseRows,
    subscriptionRows,
    paymentRows,
    cardTotals,
    currentMonth,
    currentYear,
    prevMonth,
    prevYear,
  }: {
    now: Date
    memberRows: Awaited<ReturnType<IChatSnapshotRepository['getMembers']>>
    cardRows: Awaited<ReturnType<IChatSnapshotRepository['getCards']>>
    currentPurchaseRows: SnapshotPurchaseRow[]
    prevPurchaseRows: SnapshotPurchaseRow[]
    subscriptionRows: Awaited<ReturnType<IChatSnapshotRepository['getSubscriptions']>>
    paymentRows: Awaited<ReturnType<IChatSnapshotRepository['getPayments']>>
    cardTotals: Awaited<ReturnType<IChatSnapshotRepository['getCardTotals']>>
    currentMonth: number
    currentYear: number
    prevMonth: number
    prevYear: number
  }): string {
    const today = now.toISOString().split('T')[0]
    const todayDay = now.getDate()
    const lines: string[] = []

    lines.push(
      `Você é um assistente financeiro do Card Track. Hoje é ${today} (dia ${todayDay} do mês).`,
    )
    lines.push(
      'Responda em português, de forma concisa. Cite valores em R$ com vírgula decimal.',
    )
    lines.push(
      'Valores no banco estão em centavos (inteiros), já convertidos abaixo para R$.',
    )
    lines.push('')

    lines.push('## Membros')
    if (memberRows.length === 0) {
      lines.push('(nenhum)')
    } else {
      for (const m of memberRows) lines.push(`- ${m.name} (id: ${m.id})`)
    }
    lines.push('')

    lines.push('## Cartões')
    if (cardRows.length === 0) {
      lines.push('(nenhum)')
    } else {
      for (const c of cardRows) {
        const approxClosingDay = ((c.dueDay - c.closingOffsetDays - 1 + 31) % 31) + 1
        const daysUntilClosing = approxClosingDay - todayDay
        const closingStatus =
          daysUntilClosing > 0
            ? `fecha em ${daysUntilClosing} dia(s)`
            : daysUntilClosing === 0
              ? 'fecha hoje'
              : `fechou há ${Math.abs(daysUntilClosing)} dia(s) (compras vão pra próxima fatura)`
        lines.push(
          `- ${c.name} — vencimento dia ${c.dueDay}, fecha aprox. dia ${approxClosingDay} (${closingStatus})`,
        )
      }
    }
    lines.push('')

    const currentPurchases = this.groupPurchases(currentPurchaseRows)
    lines.push(
      `## Compras — ${MONTH_NAMES[currentMonth]}/${currentYear} (${currentPurchases.length} item(s))`,
    )
    if (currentPurchases.length === 0) {
      lines.push('(nenhuma)')
    } else {
      for (const p of currentPurchases) {
        const membersStr = p.members
          .map(m => `${m.name}: ${fmt(m.amount)}`)
          .join(', ')
        lines.push(
          `- [${p.cardName}] ${p.description} — ${fmt(p.total)} (${p.installmentsCount}x) — ${membersStr}`,
        )
      }
    }
    lines.push('')

    const prevPurchases = this.groupPurchases(prevPurchaseRows)
    lines.push(
      `## Compras — ${MONTH_NAMES[prevMonth]}/${prevYear} (${prevPurchases.length} item(s))`,
    )
    if (prevPurchases.length === 0) {
      lines.push('(nenhuma)')
    } else {
      for (const p of prevPurchases) {
        const membersStr = p.members
          .map(m => `${m.name}: ${fmt(m.amount)}`)
          .join(', ')
        lines.push(
          `- [${p.cardName}] ${p.description} — ${fmt(p.total)} (${p.installmentsCount}x) — ${membersStr}`,
        )
      }
    }
    lines.push('')

    lines.push(
      `## Totais por cartão — ${MONTH_NAMES[currentMonth]}/${currentYear}`,
    )
    if (cardTotals.length === 0) {
      lines.push('(nenhum)')
    } else {
      for (const t of cardTotals) lines.push(`- ${t.cardName}: ${fmt(t.total)}`)
    }
    lines.push('')

    lines.push('## Assinaturas ativas')
    if (subscriptionRows.length === 0) {
      lines.push('(nenhuma)')
    } else {
      for (const s of subscriptionRows) {
        lines.push(
          `- ${s.name} — ${fmt(s.amount)}/mês — ${s.cardName}, pago por ${s.memberName}`,
        )
      }
    }
    lines.push('')

    lines.push(
      `## Pagamentos registrados — ${MONTH_NAMES[currentMonth]}/${currentYear}`,
    )
    if (paymentRows.length === 0) {
      lines.push('(nenhum)')
    } else {
      for (const p of paymentRows) {
        lines.push(`- ${p.memberName} → ${p.cardName}: ${fmt(p.amount)}`)
      }
    }

    return lines.join('\n')
  }

  private groupPurchases(rows: SnapshotPurchaseRow[]) {
    const map = new Map<
      string,
      {
        description: string
        installmentsCount: number
        cardName: string
        total: number
        members: Map<string, { name: string; amount: number }>
      }
    >()

    for (const row of rows) {
      let entry = map.get(row.purchaseId)
      if (!entry) {
        entry = {
          description: row.description,
          installmentsCount: row.installmentsCount,
          cardName: row.cardName,
          total: 0,
          members: new Map(),
        }
        map.set(row.purchaseId, entry)
      }
      entry.total += row.installmentAmount
      const existing = entry.members.get(row.memberName)
      if (existing) {
        existing.amount += row.installmentAmount
      } else {
        entry.members.set(row.memberName, {
          name: row.memberName,
          amount: row.installmentAmount,
        })
      }
    }

    return Array.from(map.values()).map(e => ({
      ...e,
      members: Array.from(e.members.values()),
    }))
  }
}
