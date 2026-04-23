import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function AboutPage() {
  const { t } = useTranslation()
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-6 text-3xl font-bold">{t('about.title')}</h1>
        <p className="text-muted-foreground">{t('about.description')}</p>
      </motion.div>
    </section>
  )
}
