import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function ProjectsPage() {
  const { t } = useTranslation()
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="mb-8 text-3xl font-bold">{t('projects.title')}</h1>
        <p className="text-muted-foreground">{t('projects.noProjects')}</p>
      </motion.div>
    </section>
  )
}
