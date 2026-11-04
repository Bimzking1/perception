import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center',
        className,
      )}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated text-accent">
        <Icon size={24} />
      </span>
      <h2 className="mt-5 text-lg font-bold text-fg">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
