import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatSettings } from '@/features/ai-chat/components/chat-settings'
import { useChatStore } from '@/features/ai-chat/store/use-chat-store'

export function ChatHeader() {
  const setOpen = useChatStore(s => s.setOpen)
  const clearMessages = useChatStore(s => s.clearMessages)

  const handleClose = () => {
    setOpen(false)
    clearMessages()
  }

  return (
    <div className="flex items-center gap-2 border-b px-3 py-2">
      <Sparkles className="size-4 text-primary" />
      <span className="flex-1 text-sm font-semibold">Assistente</span>
      <ChatSettings />
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={handleClose}
        aria-label="Fechar assistente"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}
