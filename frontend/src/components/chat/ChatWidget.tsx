import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Bot,
  Sparkles,
  BookOpen,
} from 'lucide-react'
import { useChatStore, type ChatMessage, type ChatSource } from '@/store/useChatStore'
import './ChatWidget.css'

// ─── Sub-components ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="chat-typing">
      <div className="chat-typing__dot" />
      <div className="chat-typing__dot" />
      <div className="chat-typing__dot" />
    </div>
  )
}

function SourceBadges({ sources }: { sources: ChatSource[] }) {
  if (!sources.length) return null
  return (
    <div className="chat-sources">
      {sources.map((s, i) => (
        <span key={i} className="chat-source-badge">
          <BookOpen size={10} />
          {s.label}
        </span>
      ))}
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`chat-bubble chat-bubble--${message.role}`}
    >
      {isUser ? (
        <p>{message.content}</p>
      ) : (
        <>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
          {message.sources && <SourceBadges sources={message.sources} />}
        </>
      )}
    </motion.div>
  )
}

// ─── Main Widget ─────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const {
    isOpen,
    messages,
    isLoading,
    error,
    toggleChat,
    sendMessage,
    clearHistory,
  } = useChatStore()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [hasOpened, setHasOpened] = useState(false)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus textarea when chat opens
  useEffect(() => {
    if (isOpen) {
      setHasOpened(true)
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Auto-resize textarea
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value)
      const el = e.target
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 100) + 'px'
    },
    []
  )

  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    await sendMessage(trimmed, i18n.language)
  }, [input, isLoading, sendMessage, i18n.language])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleSuggestion = useCallback(
    (question: string) => {
      if (isLoading) return
      sendMessage(question, i18n.language)
    },
    [isLoading, sendMessage, i18n.language]
  )

  const suggestedQuestions = useMemo(() => {
    const base = [
      t('chat.suggested.about'),
      t('chat.suggested.projects'),
      t('chat.suggested.tech'),
    ]

    // Contextual questions
    if (location.pathname.startsWith('/projects/')) {
      const projectId = location.pathname.split('/').pop()
      if (projectId && projectId !== 'new') {
        base.unshift(t('chat.suggested.this_project'))
      }
    } else if (location.pathname === '/about') {
      base.unshift(t('chat.suggested.experience'))
    }

    return base.slice(0, 3)
  }, [t, location.pathname])

  const showSuggestions = messages.length === 0 && !isLoading

  return (
    <>
      {/* ── FAB Button ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className={`chat-fab ${!hasOpened ? 'chat-fab--pulse' : ''}`}
            onClick={toggleChat}
            aria-label="Open chat"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <MessageSquare size={26} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header__left">
                <div className="chat-header__avatar">
                  <Bot size={20} />
                </div>
                <div className="chat-header__info">
                  <h3>{t('chat.title')}</h3>
                  <p>{t('chat.subtitle')}</p>
                </div>
              </div>
              <div className="chat-header__actions">
                <button
                  className="chat-header__btn"
                  onClick={clearHistory}
                  title={t('chat.clear')}
                  aria-label="Clear chat"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  className="chat-header__btn"
                  onClick={toggleChat}
                  aria-label="Close chat"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-welcome">
                  <div className="chat-welcome__icon">
                    <Sparkles size={28} />
                  </div>
                  <h4>{t('chat.welcome_title')}</h4>
                  <p>{t('chat.welcome_desc')}</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))
              )}

              {/* Typing indicator: only when streaming with empty content */}
              {isLoading &&
                messages.length > 0 &&
                messages[messages.length - 1]?.content === '' && (
                  <TypingIndicator />
                )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {showSuggestions && (
              <div className="chat-suggestions">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="chat-suggestion-btn"
                    onClick={() => handleSuggestion(q)}
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {error && <div className="chat-error">{error}</div>}

            {/* Input */}
            <div className="chat-input-area">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.placeholder')}
                rows={1}
                disabled={isLoading}
              />
              <button
                className="chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
