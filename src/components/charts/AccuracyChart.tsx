import { useId } from 'react'

export interface ChartPoint {
  label: string
  value: number
}

interface AccuracyChartProps {
  data: ChartPoint[]
  emptyLabel?: string
}

const WIDTH = 720
const HEIGHT = 240
const PADDING = { top: 16, right: 16, bottom: 30, left: 40 }

export function AccuracyChart({ data, emptyLabel = 'Complete a session to see your trend.' }: AccuracyChartProps) {
  const gradientId = useId()
  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom

  if (data.length === 0) {
    return (
      <div className="flex h-[15rem] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
        {emptyLabel}
      </div>
    )
  }

  const xFor = (index: number): number => {
    if (data.length === 1) return PADDING.left + innerWidth / 2
    return PADDING.left + (index / (data.length - 1)) * innerWidth
  }
  const yFor = (value: number): number =>
    PADDING.top + innerHeight - (Math.max(0, Math.min(100, value)) / 100) * innerHeight

  const linePoints = data.map((point, index) => `${xFor(index)},${yFor(point.value)}`).join(' ')
  const areaPoints = `${PADDING.left},${PADDING.top + innerHeight} ${linePoints} ${
    PADDING.left + innerWidth
  },${PADDING.top + innerHeight}`

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="Accuracy over recent sessions"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map((value) => (
        <g key={value}>
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={yFor(value)}
            y2={yFor(value)}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray={value === 0 ? undefined : '3 4'}
          />
          <text
            x={PADDING.left - 8}
            y={yFor(value) + 3}
            textAnchor="end"
            className="fill-muted font-mono"
            fontSize="9"
          >
            {value}
          </text>
        </g>
      ))}

      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={linePoints}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {data.map((point, index) => {
        const showLabel =
          data.length <= 8 ||
          index === 0 ||
          index === data.length - 1 ||
          index % Math.ceil(data.length / 6) === 0
        return (
          <g key={`${point.label}-${index}`}>
            <circle
              cx={xFor(index)}
              cy={yFor(point.value)}
              r="3.5"
              fill="var(--accent)"
              stroke="var(--card)"
              strokeWidth="1.5"
            >
              <title>{`${point.label}: ${point.value.toFixed(1)}%`}</title>
            </circle>
            {showLabel ? (
              <text
                x={xFor(index)}
                y={HEIGHT - 10}
                textAnchor="middle"
                className="fill-muted font-mono"
                fontSize="8.5"
              >
                {point.label}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
