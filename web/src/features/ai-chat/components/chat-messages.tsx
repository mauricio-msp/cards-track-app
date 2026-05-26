import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/features/ai-chat/store/use-chat-store'
import { cn } from '@/lib/utils'

export function ChatMessages() {
  const messages = useChatStore(s => s.messages)
  const isStreaming = useChatStore(s => s.isStreaming)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!messages.length) return

    const viewport = bottomRef.current?.closest(
      '[data-radix-scroll-area-viewport]',
    ) as HTMLElement | null

    if (viewport) viewport.scrollTop = viewport.scrollHeight
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-center text-xs text-muted-foreground">
          Pergunte sobre seus gastos, cartões ou membros.
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="min-h-0 flex-1 px-3">
      <div className="flex flex-col gap-2 py-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            data-role={msg.role}
            className={cn(
              'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
              'data-[role=assistant]:self-start data-[role=assistant]:rounded-bl-sm data-[role=assistant]:bg-muted data-[role=assistant]:text-foreground',
              'data-[role=user]:self-end data-[role=user]:rounded-br-sm data-[role=user]:bg-primary data-[role=user]:text-primary-foreground',
            )}
          >
            {msg.content}
            {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && (
              <span className="ml-1 inline-flex items-center gap-0.5 align-middle">
                <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1 rounded-full bg-current animate-bounce" />
              </span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
