import { ChatHeader } from '@/features/ai-chat/components/chat-header'
import { ChatInput } from '@/features/ai-chat/components/chat-input'
import { ChatMessages } from '@/features/ai-chat/components/chat-messages'
import { useChatStore } from '@/features/ai-chat/store/use-chat-store'
import { cn } from '@/lib/utils'

export function ChatPanel() {
  const isOpen = useChatStore(s => s.isOpen)
  const position = useChatStore(s => s.position)

  return (
    <div
      data-open={isOpen}
      data-position={position}
      className={cn(
        'fixed z-50 flex h-120 w-80 flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl transition-all duration-200 ease-out',
        'data-[open=false]:pointer-events-none data-[open=false]:translate-y-2 data-[open=false]:scale-95 data-[open=false]:opacity-0',
        'data-[open=true]:translate-y-0 data-[open=true]:scale-100 data-[open=true]:opacity-100',
        'data-[position=bottom-left]:bottom-20 data-[position=bottom-left]:left-4',
        'data-[position=bottom-right]:bottom-20 data-[position=bottom-right]:right-4',
        'data-[position=top-left]:top-20 data-[position=top-left]:left-4',
        'data-[position=top-right]:top-20 data-[position=top-right]:right-4',
      )}
    >
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  )
}
