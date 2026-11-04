import { useState } from 'react'
import { BarChart3, Home, LayoutGrid, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/games', label: 'Games', icon: LayoutGrid, end: false },
  { to: '/stats', label: 'Statistics', icon: BarChart3, end: false },
]

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
          aria-label="PERCEPTION home"
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-elevated text-fg'
                      : 'text-muted hover:bg-elevated/60 hover:text-fg',
                  )
                }
              >
                <Icon size={15} />
                {link.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-elevated text-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          'overflow-hidden border-t border-border bg-surface transition-[max-height,opacity] duration-200 md:hidden',
          mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav className="container-wide flex flex-col gap-1 py-3" aria-label="Mobile navigation">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                    isActive ? 'bg-elevated text-fg' : 'text-muted hover:text-fg',
                  )
                }
              >
                <Icon size={16} />
                {link.label}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
