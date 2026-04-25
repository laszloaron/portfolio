import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Camera, Edit3, Save, X, CheckCircle, AlertCircle, User, Eye, Trash2, FileUp, Bot } from 'lucide-react'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/useAuthStore'
import { useChatStore } from '@/store/useChatStore'
import './AboutPage.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutProfile {
  id: number
  name: string
  bio: string
  photo_url: string | null
  updated_at: string
}

// ─── Toast helper ─────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error'
interface Toast { msg: string; type: ToastType }

function ToastBanner({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl font-bold text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}
    >
      {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      <span>{toast.msg}</span>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
        <X size={16} />
      </button>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const isAdmin = user?.is_superuser ?? false

  // ── data state
  const [profile, setProfile] = useState<AboutProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // ── edit mode state
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)

  // ── photo state
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mdInputRef = useRef<HTMLInputElement>(null)

  // ── toast
  const [toast, setToast] = useState<Toast | null>(null)

  // ── fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    api.get<AboutProfile>('/api/v1/about/')
      .then(r => {
        setProfile(r.data)
        setEditName(r.data.name)
        setEditBio(r.data.bio)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // ── auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  // ── handlers ────────────────────────────────────────────────────────────────
  const handleSaveText = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const { data } = await api.put<AboutProfile>('/api/v1/about/', {
        name: editName.trim(),
        bio: editBio.trim(),
      })
      setProfile(data)
      setEditing(false)
      setPreviewMode(false)
      setToast({ msg: t('about.saveSuccess'), type: 'success' })
    } catch {
      setToast({ msg: t('about.error'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setEditName(profile.name)
      setEditBio(profile.bio)
    }
    setEditing(false)
    setPreviewMode(false)
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await api.post<AboutProfile>('/api/v1/about/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile(data)
      setToast({ msg: t('about.uploadSuccess'), type: 'success' })
    } catch {
      setToast({ msg: t('about.error'), type: 'error' })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async () => {
    if (!window.confirm("Are you sure you want to delete your profile photo?")) return
    setUploading(true)
    try {
      const { data } = await api.delete<AboutProfile>('/api/v1/about/photo')
      setProfile(data)
      setToast({ msg: t('about.uploadSuccess'), type: 'success' })
    } catch {
      setToast({ msg: t('about.error'), type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const handleMarkdownImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.md')) {
      setToast({ msg: "Please select a Markdown (.md) file.", type: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setEditBio(content)
      setToast({ msg: "Markdown file imported!", type: 'success' })
    }
    reader.readAsText(file)
    if (mdInputRef.current) mdInputRef.current.value = ''
  }

  // ─── Resolve photo URL ─────────────────────────────────────────────────────
  const photoSrc = profile?.photo_url
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${profile.photo_url}`
    : null

  // ─── Shared Content Component ──────────────────────────────────────────────
  const ProfileContent = ({ name, bio, isPlaceholder = false }: { name: string, bio: string, isPlaceholder?: boolean }) => {
    const { openChat, sendMessage } = useChatStore()

    const handleAskAI = () => {
      openChat()
      // Optional: auto-send a message or just open it
    }

    return (
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-black text-blue-900 tracking-tight">
          {isPlaceholder ? <div className="h-12 w-64 bg-blue-50 animate-pulse rounded-xl" /> : name}
        </h1>

        <div className="flex flex-wrap items-center gap-4">
          <div className="h-1 w-20 bg-blue-600 rounded-full" />
          {!isPlaceholder && (
            <button
              onClick={handleAskAI}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-all border border-blue-100 shadow-sm hover:scale-105 active:scale-95"
            >
              <Bot size={16} />
              {t('about.talkToAI')}
            </button>
          )}
        </div>

        <div className="prose prose-blue max-w-none 
          prose-headings:text-blue-900 prose-headings:font-black
          prose-p:text-blue-950 prose-p:leading-relaxed prose-p:text-lg
          prose-strong:text-blue-900
          prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded">
          {isPlaceholder ? (
            <div className="space-y-4">
              <div className="h-6 w-full bg-blue-50 animate-pulse rounded-lg" />
              <div className="h-6 w-5/6 bg-blue-50 animate-pulse rounded-lg" />
              <div className="h-6 w-4/6 bg-blue-50 animate-pulse rounded-lg" />
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {bio || ""}
            </ReactMarkdown>
          )}
        </div>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-16 px-4 bg-gray-50/50">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <ToastBanner toast={toast} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>

      <motion.section
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-3xl border border-blue-100 bg-white p-8 sm:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.08)]">

          <div className="flex flex-col md:flex-row gap-12 items-start">

            {/* ── Left Column: Photo & Actions ────────────────────────────────── */}
            <div className="flex flex-col items-center gap-6 shrink-0 mx-auto md:mx-0">
              <div className="relative group">
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-blue-100 shadow-xl bg-blue-50">
                  {loading ? (
                    <div className="w-full h-full animate-pulse bg-blue-100" />
                  ) : photoSrc ? (
                    <img src={photoSrc} alt={profile?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-200">
                      <User size={80} strokeWidth={1} />
                    </div>
                  )}
                </div>

                {/* Admin: photo actions (ONLY IN EDIT MODE) */}
                {isAdmin && editing && !previewMode && (
                  <div className="absolute inset-0 rounded-full bg-blue-900/40 flex flex-col items-center justify-center gap-3 text-white backdrop-blur-[2px]">
                    <label className="cursor-pointer hover:scale-110 transition-transform flex flex-col items-center gap-1" title="Upload Photo">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Camera size={32} />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">Change</span>
                        </>
                      )}
                    </label>

                    {photoSrc && !uploading && (
                      <button
                        onClick={handleDeletePhoto}
                        className="hover:scale-110 transition-transform text-red-200 hover:text-red-400 flex flex-col items-center gap-1"
                        title="Delete Photo"
                      >
                        <Trash2 size={24} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {!editing && isAdmin && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Edit3 size={18} />
                  {t('about.editSection')}
                </button>
              )}
            </div>

            {/* ── Right Column: Content ────────────────────────────────────────── */}
            <div className="flex-1 w-full">
              <AnimatePresence mode="wait">
                {!editing ? (
                  /* VIEW MODE */
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ProfileContent
                      name={profile?.name || ""}
                      bio={profile?.bio || ""}
                      isPlaceholder={loading}
                    />
                  </motion.div>
                ) : (
                  /* EDIT MODE (Includes Editor or Preview) */
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-end mb-4">
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors border border-blue-100 shadow-sm"
                      >
                        {previewMode ? <Edit3 size={16} /> : <Eye size={16} />}
                        {previewMode ? "Back to Editor" : "Enter Preview"}
                      </button>
                    </div>

                    {!previewMode ? (
                      /* THE EDITOR */
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-blue-900 mb-3 uppercase tracking-widest">{t('about.name')}</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/10 p-5 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-normal shadow-sm"
                            placeholder="Your Name"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-bold text-blue-900 uppercase tracking-widest">{t('about.bio')} (Markdown)</label>
                            <button
                              type="button"
                              onClick={() => mdInputRef.current?.click()}
                              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors border border-blue-100 shadow-sm"
                            >
                              <FileUp size={16} />
                              Import .md
                            </button>
                            <input
                              type="file"
                              ref={mdInputRef}
                              onChange={handleMarkdownImport}
                              accept=".md"
                              className="hidden"
                            />
                          </div>
                          <textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            rows={12}
                            className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50/10 p-5 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm font-normal shadow-sm"
                            placeholder="# Tell your story..."
                          />
                        </div>
                      </div>
                    ) : (
                      /* THE PREVIEW (Live Look & Feel) */
                      <div className="p-2">
                        <ProfileContent name={editName} bio={editBio} />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={handleSaveText}
                        disabled={saving || !editName.trim()}
                        className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95 uppercase tracking-widest disabled:opacity-50"
                      >
                        {saving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Save size={20} />
                        )}
                        {t('about.save')}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-8 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-all active:scale-95 uppercase tracking-widest"
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </motion.section>
    </div>
  )
}
