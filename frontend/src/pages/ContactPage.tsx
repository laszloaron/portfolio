import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { useAuthStore } from '../store/useAuthStore'

export default function ContactPage() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuthStore()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    try {
      await api.post('/api/v1/contact', data)
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(t('contact.error', 'Hiba történt az üzenet küldése során. Kérjük, próbálja újra később.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-8 text-3xl font-bold">{t('contact.title')}</h1>
        {!isAuthenticated ? (
          <div className="rounded-md border border-border bg-card p-6 text-center shadow-sm">
            <p className="mb-4 text-muted-foreground">
              {t('contact.login_required', 'Kérjük, jelentkezz be az üzenetküldéshez. Ezzel tudjuk biztosítani, hogy a válasz jó helyre érkezzen.')}
            </p>
            <Link 
              to="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('auth.login', 'Bejelentkezés')}
            </Link>
          </div>
        ) : submitted ? (
          <p className="rounded-md bg-primary/10 p-4 text-primary">{t('contact.success')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">{error}</p>
            )}
            
            <div className="rounded-md bg-secondary/10 p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                Üzenet küldése a következő néven: <span className="font-medium text-foreground">{user?.full_name || user?.username}</span> ({user?.email})
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {t('contact.subject', 'Tárgy')}
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                {t('contact.message')}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? t('contact.submitting', 'Küldés...') : t('contact.submit')}
            </button>
          </form>
        )}
      </motion.div>
    </section>
  )
}
