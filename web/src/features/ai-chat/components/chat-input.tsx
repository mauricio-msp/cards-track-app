import { ArrowUp } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatStream } from '@/features/ai-chat/hooks/use-chat-stream'
import { useChatStore } from '@/features/ai-chat/store/use-chat-store'

export function ChatInput() {
  const isStreaming = useChatStore(s => s.isStreaming)
  const { sendMessage } = useChatStream()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const value = textareaRef.current?.value.trim()
    if (!value || isStreaming) return
    if (textareaRef.current) textareaRef.current.value = ''
    sendMessage(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 border-t p-2">
      <Textarea
        ref={textareaRef}
        rows={1}
        placeholder="Pergunte algo..."
        disabled={isStreaming}
        onKeyDown={handleKeyDown}
        className="min-h-0 flex-1 resize-none text-sm"
      />
      <Button size="icon" disabled={isStreaming} onClick={handleSend} className="shrink-0 self-end">
        <ArrowUp className="size-4" />
      </Button>
    </div>
  )
}
