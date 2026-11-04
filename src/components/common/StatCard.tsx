import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string
  detail?: string
  icon?: LucideIcon
  className?: string
}

export function StatCard({ label, value, detail, icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4 sm:p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">{label}</span>
        {Icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-elevated text-accent">
            <Icon size={15} />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs text-muted">{detail}</p> : null}
    </div>
  )
}
