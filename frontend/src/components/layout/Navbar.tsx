import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Moon, Sun, Globe } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme, language, setLanguage } = useAppStore()
  const { isAuthenticated, user, logout } = useAuthStore()

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Sync i18next language with store
  useEffect(() => {
    i18n.changeLanguage(language)
  }, [language, i18n])

  const handleLanguageToggle = () => {
    const next = language === 'hu' ? 'en' : 'hu'
    setLanguage(next)
  }

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/projects', label: t('nav.projects') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="text-lg font-bold text-primary">
          Portfolio
        </Link>

        {/* Nav links */}
        <ul className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* User Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 mr-2">
              <span className="text-sm font-medium text-foreground">
                {user?.is_superuser && (
                  <span className="mr-2 inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                    Admin
                  </span>
                )}
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="mr-2 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Sign in
            </Link>
          )}

          {/* Language toggle */}
          <button
            onClick={handleLanguageToggle}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            title={t(`language.${language === 'hu' ? 'en' : 'hu'}`)}
            aria-label="Toggle language"
          >
            <Globe className="h-4 w-4" />
            <span className="ml-1 text-xs uppercase">{language}</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground"
            title={t(`theme.${theme === 'light' ? 'dark' : 'light'}`)}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
