import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
          {t('hero.subtitle')}
        </p>
        <Link
          to="/projects"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t('hero.cta')}
        </Link>
      </motion.div>
    </section>
  )
}
