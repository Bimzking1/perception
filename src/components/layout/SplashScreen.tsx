import { useEffect, useState } from 'react'
import { BrandMark } from './Logo'
import { cn } from '../../lib/utils'

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const holdTimer = window.setTimeout(() => setLeaving(true), reduceMotion ? 1600 : 2100)
    const doneTimer = window.setTimeout(onDone, reduceMotion ? 2000 : 2600)

    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      role="status"
      aria-label="Loading PERCEPTION"
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-bg transition-opacity duration-500',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--accent-soft), transparent 65%)' }}
      />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="animate-splash-in">
          <BrandMark
            className="h-24 w-24 rounded-[1.75rem] shadow-[0_20px_80px_-20px_var(--accent)] sm:h-28 sm:w-28"
            glow
          />
        </div>
        <h1 className="mt-8 animate-splash-in text-4xl font-extrabold uppercase tracking-[0.34em] text-fg sm:text-5xl">
          Perception
        </h1>
        <p className="mt-4 max-w-sm animate-fade-up text-sm text-muted [animation-delay:180ms] sm:text-base">
          Trust your instincts. Test your perception.
        </p>
        <div className="mt-10 h-px w-48 overflow-hidden bg-border">
          <div className="h-full w-full animate-draw-x bg-accent" />
        </div>
      </div>

      <span className="absolute bottom-8 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted/70">
        Human Measurement Lab
      </span>
    </div>
  )
}
