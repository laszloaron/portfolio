import { create } from 'zustand'
import api from '@/lib/axios'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: ChatSource[]
  isStreaming?: boolean
}

export interface ChatSource {
  type: string
  label: string
  detail?: string | null
}

interface ChatState {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  sendMessage: (content: string, language: string) => Promise<void>
  clearHistory: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let messageCounter = 0
function generateId(): string {
  return `msg_${Date.now()}_${++messageCounter}`
}

function getHistoryForRequest(messages: ChatMessage[]) {
  return messages
    .filter((m) => !m.isStreaming)
    .slice(-20) // max 20 messages
    .map((m) => ({ role: m.role, content: m.content }))
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  clearHistory: () => set({ messages: [], error: null }),

  sendMessage: async (content: string, language: string) => {
    const { messages } = get()

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
    }

    // Add placeholder assistant message for streaming
    const assistantId = generateId()
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    set({
      messages: [...messages, userMsg, assistantMsg],
      isLoading: true,
      error: null,
    })

    const history = getHistoryForRequest(messages)

    try {
      // Use streaming endpoint via fetch (not axios, since we need ReadableStream)
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/v1/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history, language }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        const detail = errData?.detail || `Error ${response.status}`
        throw new Error(detail)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let accumulatedText = ''
      let sources: ChatSource[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()

          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)

            if (parsed.type === 'delta') {
              accumulatedText += parsed.content
              // Update the streaming message
              set((s) => ({
                messages: s.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: accumulatedText }
                    : m
                ),
              }))
            } else if (parsed.type === 'sources') {
              sources = parsed.sources || []
            } else if (parsed.type === 'error') {
              throw new Error(parsed.content)
            }
          } catch (e) {
            // Skip unparseable lines (might be partial JSON)
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }

      // Finalize the assistant message
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: accumulatedText || 'No response received.',
                sources,
                isStreaming: false,
              }
            : m
        ),
        isLoading: false,
      }))
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong'

      // Remove the empty assistant placeholder and set error
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== assistantId),
        isLoading: false,
        error: errorMessage,
      }))
    }
  },
}))
