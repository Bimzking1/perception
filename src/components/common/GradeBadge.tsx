import type { Grade } from '../../types'
import { cn } from '../../lib/utils'

const gradeClasses: Record<Grade, string> = {
  S: 'border-accent/45 bg-accent-soft text-accent',
  A: 'border-success/40 bg-success-soft text-success',
  B: 'border-accent/30 bg-accent-soft text-accent',
  C: 'border-warning/35 bg-warning-soft text-warning',
  D: 'border-warning/30 bg-warning-soft text-warning',
  F: 'border-danger/35 bg-danger-soft text-danger',
}

interface GradeBadgeProps {
  grade: Grade
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GradeBadge({ grade, size = 'md', className }: GradeBadgeProps) {
  return (
    <span
      aria-label={`Grade ${grade}`}
      className={cn(
        'inline-flex items-center justify-center border font-mono font-bold leading-none',
        size === 'sm' && 'h-7 min-w-7 rounded-lg px-2 text-xs',
        size === 'md' && 'h-9 min-w-9 rounded-xl px-2.5 text-sm',
        size === 'lg' && 'h-16 min-w-16 rounded-2xl text-3xl',
        gradeClasses[grade],
        className,
      )}
    >
      {grade}
    </span>
  )
}
