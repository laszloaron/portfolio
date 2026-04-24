import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import api from '../lib/axios'

export default function ContactPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
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
        {submitted ? (
          <p className="rounded-md bg-primary/10 p-4 text-primary">{t('contact.success')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">{error}</p>
            )}
            {(['name', 'email', 'subject'] as const).map((field) => (
              <div key={field}>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  {t(`contact.${field}`)}
                </label>
                <input
                  id={field}
                  name={field}
                  type={field === 'email' ? 'email' : 'text'}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
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
