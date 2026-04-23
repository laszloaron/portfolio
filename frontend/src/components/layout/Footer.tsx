import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <p className="text-sm text-muted-foreground">
          © {year} Portfolio. {t('footer.rights')}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
