import { cn } from '../../lib/utils'

interface ProgressIndicatorProps {
  current: number
  total: number
  className?: string
  showLabel?: boolean
}

export function ProgressIndicator({
  current,
  total,
  className,
  showLabel = true,
}: ProgressIndicatorProps) {
  const safeTotal = Math.max(1, total)
  const completed = Math.min(current, safeTotal)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="flex flex-1 items-center gap-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={completed}
        aria-label={`${completed} of ${safeTotal} games complete`}
      >
        {Array.from({ length: safeTotal }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors duration-300',
              index < completed ? 'bg-accent' : index === completed ? 'bg-accent/40' : 'bg-elevated',
            )}
          />
        ))}
      </div>
      {showLabel ? (
        <span className="shrink-0 font-mono text-xs font-medium text-muted">
          {completed}/{safeTotal}
        </span>
      ) : null}
    </div>
  )
}
