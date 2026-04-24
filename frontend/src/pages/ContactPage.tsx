import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Linkedin, Mail, ExternalLink, Send } from 'lucide-react'
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
      reply_to: formData.get('reply_to') || user?.email,
      subject: formData.get('subject'),
      message: formData.get('message'),
    }

    try {
      await api.post('/api/v1/contact', data)
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to send message:', err)
      setError(t('contact.error', 'Hiba történt az üzenet küldése során. Kérjük, ellenőrizze az adatokat és próbálja újra.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-12 text-center"
      >
        <h1 className="mb-4 text-4xl font-bold tracking-tight">{t('contact.title', 'Kapcsolat')}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('contact.subtitle', 'Lépjünk kapcsolatba! Válaszd a számodra legkényelmesebb formátumot.')}
        </p>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2 items-start">
        {/* LinkedIn Card */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-8 shadow-sm flex flex-col items-center text-center h-full"
        >
          <div className="rounded-full bg-blue-500/10 p-5 mb-6">
            <Linkedin className="h-10 w-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">LinkedIn</h2>
          <p className="text-muted-foreground mb-8 flex-grow">
            {t('contact.linkedin_desc', 'A leggyorsabb módja a szakmai kapcsolatfelvételnek. Csatlakozz a hálózatomhoz, és beszélgessünk ott!')}
          </p>
          <a
            href="https://linkedin.com/" // Később cseréld le a saját LinkedIn linkdre!
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-[#0077b5] px-8 text-sm font-medium text-white transition-colors hover:bg-[#006396] shadow-sm"
          >
            {t('contact.linkedin_btn', 'Irány a LinkedIn')}
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </motion.div>

        {/* Email Card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-8 shadow-sm h-full"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">E-mail</h2>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center border-2 border-dashed border-border rounded-lg p-6 bg-secondary/5">
              <p className="mb-6 text-muted-foreground">
                {t('contact.login_required', 'Kérjük, jelentkezz be az üzenetküldéshez. Ezzel tudjuk biztosítani, hogy a válasz jó helyre érkezzen.')}
              </p>
              <Link 
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('auth.login', 'Bejelentkezés')}
              </Link>
            </div>
          ) : submitted ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center border-2 border-dashed border-primary/20 rounded-lg p-6 bg-primary/5">
              <div className="rounded-full bg-green-500/20 p-4 mb-4">
                <Send className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">{t('contact.success_title', 'Sikeres küldés!')}</h3>
              <p className="text-muted-foreground">{t('contact.success_desc', 'Az üzenetedet megkaptam, hamarosan válaszolok.')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-destructive text-sm font-medium">{error}</p>
              )}
              
              <div className="rounded-md bg-secondary/10 p-4 border border-secondary/20">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                  Küldés mint: <strong className="text-foreground">{user?.full_name || user?.username}</strong>
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('contact.reply_to', 'Válaszcím (E-mail)')}
                </label>
                <input
                  id="reply_to"
                  name="reply_to"
                  type="email"
                  required
                  defaultValue={user?.email}
                  className="w-full rounded-md border border-input bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="pelda@email.hu"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('contact.subject', 'Tárgy')}
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  minLength={2}
                  maxLength={200}
                  className="w-full rounded-md border border-input bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  placeholder="Miben segíthetek?"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t('contact.message', 'Üzenet')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  minLength={10}
                  maxLength={5000}
                  className="w-full rounded-md border border-input bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                  placeholder="Írd ide az üzeneted (minimum 10 karakter)..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? t('contact.submitting', 'Küldés folyamatban...') : t('contact.submit', 'Üzenet küldése')}
                {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
