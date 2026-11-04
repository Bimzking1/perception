import { useMemo, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { Target } from 'lucide-react'
import type { GameComponentProps, GameDefinition } from '../../../../types'
import { accuracyFromError, clamp } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

interface Mass {
  x: number
  y: number
  r: number
  shape: 'circle' | 'square'
  weight: number
  opacity: number
}

interface Point {
  x: number
  y: number
}

function CenterGravityGame({ seed, locked, onComplete }: GameComponentProps) {
  const masses = useMemo<Mass[]>(() => {
    const rng = createRng(`center-gravity:${seed}`)
    const count = rng.int(5, 8)
    return Array.from({ length: count }, () => {
      const r = rng.between(4.5, 10.5)
      const weight = r * r * (rng.bool() ? 1 : 0.72)
      return {
        x: rng.between(16, 84),
        y: rng.between(16, 74),
        r,
        shape: rng.pick(['circle', 'square'] as const),
        weight,
        opacity: rng.between(0.55, 0.95),
      }
    })
  }, [seed])

  const center = useMemo<Point>(() => {
    const totalWeight = masses.reduce((sum, mass) => sum + mass.weight, 0)
    return {
      x: masses.reduce((sum, mass) => sum + mass.x * mass.weight, 0) / totalWeight,
      y: masses.reduce((sum, mass) => sum + mass.y * mass.weight, 0) / totalWeight,
    }
  }, [masses])

  const [guess, setGuess] = useState<Point | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted

  const place = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (isLocked) return
    const rect = event.currentTarget.getBoundingClientRect()
    setGuess({
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100),
    })
  }

  const moveGuess = (dx: number, dy: number) => {
    if (isLocked) return
    setGuess((current) => {
      const base = current ?? { x: 50, y: 50 }
      return { x: clamp(base.x + dx, 0, 100), y: clamp(base.y + dy, 0, 100) }
    })
  }

  const submit = () => {
    if (isLocked || !guess) return
    const distance = Math.hypot(guess.x - center.x, guess.y - center.y) / Math.SQRT2
    setSubmitted(true)
    onComplete({
      accuracy: accuracyFromError(distance, 0.3),
      answerLabel: `${Math.round(guess.x)}%, ${Math.round(guess.y)}%`,
      correctLabel: `${Math.round(center.x)}%, ${Math.round(center.y)}%`,
      errorLabel: `${(distance * 100).toFixed(1)}% of diagonal`,
      note: 'Weighted by shape area',
      rawAnswer: `${Math.round(guess.x)},${Math.round(guess.y)}`,
      rawCorrect: `${Math.round(center.x)},${Math.round(center.y)}`,
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
        <svg
          viewBox="0 0 100 100"
          className="h-full max-h-[26rem] w-full cursor-crosshair touch-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
          onClick={place}
          tabIndex={0}
          role="application"
          aria-label="Click to place the center of mass marker"
          onKeyDown={(event) => {
            const step = event.shiftKey ? 4 : 1
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              moveGuess(-step, 0)
            } else if (event.key === 'ArrowRight') {
              event.preventDefault()
              moveGuess(step, 0)
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              moveGuess(0, -step)
            } else if (event.key === 'ArrowDown') {
              event.preventDefault()
              moveGuess(0, step)
            }
          }}
        >
          <defs>
            <pattern id="gravity-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" className="fill-none stroke-border" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#gravity-grid)" />

          {masses.map((mass, index) =>
            mass.shape === 'square' ? (
              <rect
                key={index}
                x={mass.x - mass.r}
                y={mass.y - mass.r}
                width={mass.r * 2}
                height={mass.r * 2}
                rx="1"
                className="fill-accent stroke-accent"
                opacity={mass.opacity}
                strokeWidth="0.25"
              />
            ) : (
              <circle
                key={index}
                cx={mass.x}
                cy={mass.y}
                r={mass.r}
                className="fill-accent stroke-accent"
                opacity={mass.opacity}
                strokeWidth="0.25"
              />
            ),
          )}

          {guess ? (
            <g>
              <line
                x1={guess.x}
                y1={guess.y - 4}
                x2={guess.x}
                y2={guess.y + 4}
                className="stroke-fg"
                strokeWidth="0.5"
              />
              <line
                x1={guess.x - 4}
                y1={guess.y}
                x2={guess.x + 4}
                y2={guess.y}
                className="stroke-fg"
                strokeWidth="0.5"
              />
              <circle cx={guess.x} cy={guess.y} r="1.2" className="fill-fg" />
            </g>
          ) : null}

          {isLocked ? (
            <g>
              <line
                x1={center.x}
                y1={center.y - 6}
                x2={center.x}
                y2={center.y + 6}
                className="stroke-success"
                strokeWidth="0.8"
              />
              <line
                x1={center.x - 6}
                y1={center.y}
                x2={center.x + 6}
                y2={center.y}
                className="stroke-success"
                strokeWidth="0.8"
              />
              <circle
                cx={center.x}
                cy={center.y}
                r="3"
                className="fill-none stroke-success"
                strokeWidth="0.6"
              />
            </g>
          ) : null}
        </svg>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-fg">Mark the center of mass</p>
            <p className="mt-1 text-xs text-muted">
              Larger shapes carry more weight. Click anywhere to place your marker.
            </p>
          </div>
          <Button onClick={submit} disabled={isLocked || !guess} size="sm">
            Submit center
          </Button>
        </div>
      </div>
    </div>
  )
}

export const centerGravityGame: GameDefinition = {
  id: 'center-gravity',
  name: 'Center of Gravity',
  description: 'Find the weighted balance point of scattered masses.',
  instructions: [
    'Several shapes of different sizes appear.',
    'Click where you estimate their combined center of mass.',
    'The true center is weighted by each shape’s area. Distance from it sets your score.',
  ],
  category: 'Spatial',
  difficulty: 'Medium',
  estimatedSeconds: 30,
  rounds: 1,
  icon: Target,
  component: CenterGravityGame,
}
