// web/src/features/ai-chat/store/use-chat-store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

export type Message = { role: 'user' | 'assistant'; content: string }

type ChatStore = {
  messages: Message[]
  isOpen: boolean
  isStreaming: boolean
  position: Position
  shortcut: string
  addUserMessage: (content: string) => void
  addAssistantMessage: () => void
  appendToken: (token: string) => void
  setStreaming: (v: boolean) => void
  toggleOpen: () => void
  setOpen: (v: boolean) => void
  setPosition: (p: Position) => void
  setShortcut: (s: string) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    set => ({
      messages: [],
      isOpen: false,
      isStreaming: false,
      position: 'bottom-right',
      shortcut: 'ctrl+k',

      addUserMessage: content =>
        set(state => ({
          messages: [...state.messages, { role: 'user', content }],
        })),

      addAssistantMessage: () =>
        set(state => ({
          messages: [...state.messages, { role: 'assistant', content: '' }],
        })),

      appendToken: token =>
        set(state => {
          const messages = [...state.messages]
          const last = messages[messages.length - 1]
          if (last?.role === 'assistant') {
            messages[messages.length - 1] = {
              ...last,
              content: last.content + token,
            }
          }
          return { messages }
        }),

      setStreaming: v => set({ isStreaming: v }),
      toggleOpen: () => set(state => ({ isOpen: !state.isOpen })),
      setOpen: v => set({ isOpen: v }),
      setPosition: p => set({ position: p }),
      setShortcut: s => set({ shortcut: s }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'card-track:chat-settings',
      partialize: state => ({
        position: state.position,
        shortcut: state.shortcut,
      }),
    },
  ),
)
