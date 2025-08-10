import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme()
  const current = theme === 'system' ? systemTheme : theme
  const isDark = current === 'dark'
  return (
    <button
      aria-label="Tema değiştir"
      className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm hover:bg-accent"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title="Karanlık mod"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden md:inline">{isDark ? 'Açık' : 'Koyu'}</span>
    </button>
  )
}
