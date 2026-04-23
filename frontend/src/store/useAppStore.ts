import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = 'light' | 'dark'
type Language = 'hu' | 'en'

interface AppState {
  // Theme
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void

  // Language
  language: Language
  setLanguage: (language: Language) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      toggleTheme: () =>
        set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setTheme: (theme) => set({ theme }),

      // Language
      language: 'hu',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'portfolio-store',
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    }
  )
)
