import { useEffect } from 'react'
import { ChatFab } from '@/features/ai-chat/components/chat-fab'
import { ChatPanel } from '@/features/ai-chat/components/chat-panel'
import { useChatStore } from '@/features/ai-chat/store/use-chat-store'

export function ChatWidget() {
  const shortcut = useChatStore(s => s.shortcut)
  const toggleOpen = useChatStore(s => s.toggleOpen)
  const isOpen = useChatStore(s => s.isOpen)
  const setOpen = useChatStore(s => s.setOpen)

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const parts = shortcut.toLowerCase().split('+')
      const key = parts[parts.length - 1]
      const needsCtrl = parts.includes('ctrl')
      const needsAlt = parts.includes('alt')
      const needsShift = parts.includes('shift')

      if (
        e.key.toLowerCase() === key &&
        e.ctrlKey === needsCtrl &&
        e.altKey === needsAlt &&
        e.shiftKey === needsShift
      ) {
        e.preventDefault()
        toggleOpen()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcut, toggleOpen])

  return (
    <>
      <div
        role="presentation"
        data-open={isOpen}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-200 data-[open=false]:pointer-events-none data-[open=false]:opacity-0"
        onClick={() => setOpen(false)}
        onKeyDown={() => setOpen(false)}
      />
      <ChatFab />
      <ChatPanel />
    </>
  )
}
