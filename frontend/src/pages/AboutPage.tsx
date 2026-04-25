import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Edit3, Save, X, CheckCircle, AlertCircle, User } from 'lucide-react'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/useAuthStore'
import './AboutPage.css'

interface AboutProfile {
  id: number
  name: string
  bio: string
  photo_url: string | null
  updated_at: string
}

type ToastType = 'success' | 'error'
interface Toast { msg: string; type: ToastType }

function ToastBanner({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`about-toast about-toast--${toast.type}`}
    >
      {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span>{toast.msg}</span>
      <button onClick={onDismiss} aria-label="Dismiss"><X size={14} /></button>
    </motion.div>
  )
}

export default function AboutPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const isAdmin = user?.is_superuser ?? false

  const [profile, setProfile] = useState<AboutProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    api.get<AboutProfile>('/api/v1/about/')
      .then(r => { setProfile(r.data); setEditName(r.data.name); setEditBio(r.data.bio) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(id)
  }, [toast])

  const handleSaveText = async () => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const { data } = await api.put<AboutProfile>('/api/v1/about/', { name: editName.trim(), bio: editBio.trim() })
      setProfile(data); setEditing(false)
      setToast({ msg: t('about.saveSuccess'), type: 'success' })
    } catch { setToast({ msg: t('about.error'), type: 'error' }) }
    finally { setSaving(false) }
  }

  const handleCancelEdit = () => {
    if (profile) { setEditName(profile.name); setEditBio(profile.bio) }
    setEditing(false)
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await api.post<AboutProfile>('/api/v1/about/photo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfile(data)
      setToast({ msg: t('about.uploadSuccess'), type: 'success' })
    } catch { setToast({ msg: t('about.error'), type: 'error' }) }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const photoSrc = profile?.photo_url
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${profile.photo_url}`
    : null

  return (
    <div className="about-page">
      <AnimatePresence>
        {toast && <ToastBanner toast={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
      <div className="about-hero-bg" aria-hidden />
      <motion.section
        className="about-container"
        initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="about-photo-col">
          <div className="about-photo-wrapper">
            {loading ? <div className="about-photo-skeleton" aria-label="Loading…" />
              : photoSrc ? <img src={photoSrc} alt={profile?.name} className="about-photo" />
              : <div className="about-photo-placeholder"><User size={72} strokeWidth={1.2} /></div>}
            {isAdmin && (
              <label
                className={`about-photo-overlay ${uploading ? 'about-photo-overlay--busy' : ''}`}
                title={t('about.savePhoto')} aria-label={t('about.savePhoto')}
              >
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only" onChange={handlePhotoChange} disabled={uploading} id="about-photo-input" />
                {uploading ? <span className="about-spinner" /> : <Camera size={22} />}
              </label>
            )}
          </div>
        </div>
        <div className="about-text-col">
          <AnimatePresence mode="wait">
            {!editing ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="about-name-row">
                  <h1 className="about-name">
                    {loading ? <span className="about-skeleton-line w-48" /> : profile?.name || '—'}
                  </h1>
                  {isAdmin && (
                    <button className="about-icon-btn" onClick={() => setEditing(true)}
                      title={t('about.editSection')} aria-label={t('about.editSection')} id="about-edit-btn">
                      <Edit3 size={18} />
                    </button>
                  )}
                </div>
                <div className="about-divider" />
                {loading ? (
                  <>
                    <span className="about-skeleton-line w-full mb-2" />
                    <span className="about-skeleton-line w-5/6 mb-2" />
                    <span className="about-skeleton-line w-4/6" />
                  </>
                ) : (
                  <p className="about-bio">
                    {profile?.bio || <em className="about-bio--empty">No bio yet.</em>}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }} className="about-edit-form">
                <h2 className="about-edit-title">{t('about.editSection')}</h2>
                <label htmlFor="about-edit-name" className="about-label">{t('about.name')}</label>
                <input id="about-edit-name" type="text" className="about-input"
                  value={editName} onChange={e => setEditName(e.target.value)} disabled={saving} maxLength={255} />
                <label htmlFor="about-edit-bio" className="about-label">{t('about.bio')}</label>
                <textarea id="about-edit-bio" className="about-textarea"
                  value={editBio} onChange={e => setEditBio(e.target.value)} disabled={saving} rows={6} />
                <div className="about-edit-actions">
                  <button id="about-save-btn" className="about-btn about-btn--primary"
                    onClick={handleSaveText} disabled={saving || !editName.trim()}>
                    {saving ? <><span className="about-spinner about-spinner--sm" />{t('about.saving')}</>
                      : <><Save size={16} />{t('about.save')}</>}
                  </button>
                  <button id="about-cancel-btn" className="about-btn about-btn--ghost"
                    onClick={handleCancelEdit} disabled={saving}>
                    <X size={16} /> Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  )
}
