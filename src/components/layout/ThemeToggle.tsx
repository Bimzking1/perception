import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../app/providers/ThemeProvider'
import { cn } from '../../lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-elevated text-muted transition-colors hover:border-accent/50 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70',
        className,
      )}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
