import { cn } from '../../lib/utils'

interface BrandMarkProps {
  className?: string
  glow?: boolean
}

export function BrandMark({ className, glow = false }: BrandMarkProps) {
  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] border border-border bg-elevated',
        className,
      )}
    >
      {glow ? (
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-accent/40 animate-ring-pulse" />
      ) : null}
      <img
        src="/eye.png"
        alt=""
        className="h-full w-full object-cover"
        draggable={false}
      />
    </span>
  )
}

interface LogoProps {
  className?: string
  markClassName?: string
  showWordmark?: boolean
  glow?: boolean
}

export function Logo({ className, markClassName, showWordmark = true, glow }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <BrandMark className={cn('h-8 w-8', markClassName)} glow={glow} />
      {showWordmark ? (
        <span className="text-[0.95rem] font-extrabold uppercase tracking-[0.22em] text-fg">
          Perception
        </span>
      ) : null}
    </span>
  )
}
