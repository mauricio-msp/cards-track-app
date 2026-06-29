import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type Position, useChatStore } from '@/features/ai-chat/store/use-chat-store'
import { cn } from '@/lib/utils'

export function ChatFab() {
  const toggleOpen = useChatStore(s => s.toggleOpen)
  const position = useChatStore(s => s.position)

  return (
    <Button
      size="icon"
      onClick={toggleOpen}
      data-position={position as Position}
      aria-label="Abrir assistente"
      className={cn(
        'fixed z-50 size-12 rounded-full shadow-lg',
        'data-[position=bottom-left]:bottom-4 data-[position=bottom-left]:left-4',
        'data-[position=bottom-right]:bottom-4 data-[position=bottom-right]:right-4',
        'data-[position=top-left]:top-4 data-[position=top-left]:left-4',
        'data-[position=top-right]:top-4 data-[position=top-right]:right-4',
      )}
    >
      <Sparkles className="size-5" />
    </Button>
  )
}
