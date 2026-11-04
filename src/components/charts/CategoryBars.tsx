import { formatAccuracy } from '../../lib/utils'

export interface CategoryStat {
  label: string
  value: number
  plays: number
}

export function CategoryBars({ data }: { data: CategoryStat[] }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-fg">{item.label}</span>
            <span className="font-mono text-xs text-muted">
              {formatAccuracy(item.value)} · {item.plays} {item.plays === 1 ? 'game' : 'games'}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
