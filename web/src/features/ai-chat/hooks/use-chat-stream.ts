import { useCallback } from 'react'
import { chatWithAI } from '@/features/ai-chat/api/chat'
import { useChatStore } from '@/features/ai-chat/store/use-chat-store'

export function useChatStream() {
  const addUserMessage = useChatStore(s => s.addUserMessage)
  const addAssistantMessage = useChatStore(s => s.addAssistantMessage)
  const appendToken = useChatStore(s => s.appendToken)
  const setStreaming = useChatStore(s => s.setStreaming)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      // Capture messages before adding the new one (for sending to API). Cap at last 20 to avoid context overflow.
      const history = useChatStore.getState().messages.slice(-20)
      const messagesToSend = [...history, { role: 'user' as const, content }]

      addUserMessage(content)
      addAssistantMessage()
      setStreaming(true)

      try {
        const stream = await chatWithAI(messagesToSend)
        const reader = stream.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        outer: while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') break outer
            try {
              const parsed = JSON.parse(data) as { token?: string; error?: string }
              if (parsed.token) appendToken(parsed.token)
              if (parsed.error) {
                appendToken(parsed.error)
                break outer
              }
            } catch {
              // ignore malformed SSE lines
            }
          }
        }
      } catch {
        appendToken('Erro ao conectar. Tente novamente.')
      } finally {
        setStreaming(false)
      }
    },
    [addUserMessage, addAssistantMessage, appendToken, setStreaming],
  )

  return { sendMessage }
}
