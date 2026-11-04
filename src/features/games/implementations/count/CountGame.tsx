import { useMemo, useState } from 'react'
import { Hash } from 'lucide-react'
import type { GameComponentProps, GameDefinition, Difficulty } from '../../../../types'
import { accuracyFromError } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

interface Dot {
  x: number
  y: number
  r: number
  shape: 'circle' | 'square' | 'triangle'
  opacity: number
}

function countForDifficulty(difficulty: Difficulty): number {
  if (difficulty === 'Easy') return 14
  if (difficulty === 'Hard') return 32
  return 22
}

function generateDots(seed: string, difficulty: Difficulty): Dot[] {
  const rng = createRng(`count:${seed}`)
  const center = countForDifficulty(difficulty)
  const total = center + rng.int(-3, 7)
  const dots: Dot[] = []
  let attempts = 0

  while (dots.length < total && attempts < 900) {
    attempts += 1
    const r = rng.between(2.1, 3.7)
    const candidate: Dot = {
      x: rng.between(7, 93),
      y: rng.between(7, 93),
      r,
      shape: rng.pick(['circle', 'square', 'triangle'] as const),
      opacity: rng.between(0.62, 1),
    }
    const overlaps = dots.some((dot) => {
      const dx = dot.x - candidate.x
      const dy = dot.y - candidate.y
      return Math.hypot(dx, dy) < dot.r + candidate.r + 0.9
    })
    if (!overlaps) dots.push(candidate)
  }

  return dots
}

function Shape({ dot }: { dot: Dot }) {
  if (dot.shape === 'square') {
    const size = dot.r * 1.85
    return (
      <rect
        x={dot.x - size / 2}
        y={dot.y - size / 2}
        width={size}
        height={size}
        rx={0.5}
        className="fill-accent"
        opacity={dot.opacity}
      />
    )
  }
  if (dot.shape === 'triangle') {
    const points = [
      `${dot.x},${dot.y - dot.r * 1.25}`,
      `${dot.x + dot.r * 1.15},${dot.y + dot.r * 0.9}`,
      `${dot.x - dot.r * 1.15},${dot.y + dot.r * 0.9}`,
    ].join(' ')
    return <polygon points={points} className="fill-accent" opacity={dot.opacity} />
  }
  return <circle cx={dot.x} cy={dot.y} r={dot.r} className="fill-accent" opacity={dot.opacity} />
}

function CountGame({ seed, difficulty, locked, onComplete }: GameComponentProps) {
  const dots = useMemo(() => generateDots(seed, difficulty), [seed, difficulty])
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const actual = dots.length

  const submit = () => {
    if (locked || submitted) return
    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed < 0) return

    const difference = Math.abs(parsed - actual)
    const tolerance = Math.max(3, actual * 0.28)
    setSubmitted(true)
    onComplete({
      accuracy: accuracyFromError(difference, tolerance),
      answerLabel: `${parsed}`,
      correctLabel: `${actual}`,
      errorLabel: `${difference} ${difference === 1 ? 'object' : 'objects'} off`,
      rawAnswer: parsed,
      rawCorrect: actual,
    })
  }

  const adjust = (amount: number) => {
    if (locked || submitted) return
    const current = Number.parseInt(value, 10)
    const next = Math.max(0, (Number.isFinite(current) ? current : 0) + amount)
    setValue(`${next}`)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface">
        <svg
          viewBox="0 0 100 100"
          className="h-full max-h-[26rem] w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="A field of scattered shapes to count"
        >
          {dots.map((dot, index) => (
            <Shape key={index} dot={dot} />
          ))}
        </svg>
        <span className="absolute left-3 top-3 rounded-lg border border-border bg-card/80 px-2 py-1 font-mono text-[0.65rem] text-muted backdrop-blur">
          Estimate the total
        </span>
      </div>

      <form
        className="rounded-2xl border border-border bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <label htmlFor="count-answer" className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Your count
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            id="count-answer"
            type="number"
            min={0}
            inputMode="numeric"
            value={value}
            disabled={locked || submitted}
            onChange={(event) => setValue(event.target.value)}
            placeholder="0"
            className="h-11 w-28 rounded-xl border border-border bg-card px-3 font-mono text-lg font-semibold text-fg outline-none transition-colors placeholder:text-muted/40 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
          />
          <div className="flex items-center gap-1.5">
            {[-5, -1, 1, 5].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => adjust(amount)}
                disabled={locked || submitted}
                className="h-9 min-w-9 rounded-lg border border-border bg-elevated px-2 font-mono text-xs font-semibold text-muted transition-colors hover:border-accent/50 hover:text-fg disabled:opacity-40"
              >
                {amount > 0 ? `+${amount}` : amount}
              </button>
            ))}
          </div>
          <Button type="submit" className="ml-auto" disabled={locked || submitted || value === ''}>
            Submit count
          </Button>
        </div>
      </form>
    </div>
  )
}

export const countGame: GameDefinition = {
  id: 'count',
  name: 'Count',
  description: 'Estimate how many scattered shapes are in the field.',
  instructions: [
    'A field of random shapes appears for as long as you need.',
    'Estimate the total number without counting one by one.',
    'Your score is based on how close your estimate is to the real count.',
  ],
  category: 'Quantity',
  difficulty: 'Medium',
  estimatedSeconds: 35,
  rounds: 1,
  icon: Hash,
  component: CountGame,
}
