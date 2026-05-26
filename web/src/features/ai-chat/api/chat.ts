import type { Message } from '@/features/ai-chat/store/use-chat-store'
import { apiUrl } from '@/lib/api-client'

export async function chatWithAI(messages: Message[]): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(apiUrl('/api/ai/chat').toString(), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `HTTP ${response.status}`)
  }

  if (!response.body) throw new Error('No response body')
  return response.body
}
