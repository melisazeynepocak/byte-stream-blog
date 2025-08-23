import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme()
  const current = theme === 'system' ? systemTheme : theme
  const isDark = current === 'dark'
  return (
    <button
      aria-label="Tema değiştir"
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 dark:border-white/10 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-950/50 dark:hover:to-purple-950/50 transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-800 group"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Açık moda geç' : 'Koyu moda geç'}
    >
      {isDark ? (
        <Sun size={18} className="group-hover:text-primary transition-colors duration-300" />
      ) : (
        <Moon size={18} className="group-hover:text-primary transition-colors duration-300" />
      )}
    </button>
  )
}
