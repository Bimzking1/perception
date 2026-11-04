import { useMemo, useState } from 'react'
import { Droplets } from 'lucide-react'
import type { GameComponentProps, GameDefinition } from '../../../../types'
import { accuracyFromError } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

function WaterLevelGame({ seed, locked, onComplete }: GameComponentProps) {
  const actual = useMemo(() => {
    const rng = createRng(`water:${seed}`)
    return rng.int(18, 82)
  }, [seed])

  const [guess, setGuess] = useState(50)
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted

  const submit = () => {
    if (isLocked) return
    const difference = Math.abs(guess - actual)
    setSubmitted(true)
    onComplete({
      accuracy: accuracyFromError(difference, 30),
      answerLabel: `${guess}%`,
      correctLabel: `${actual}%`,
      errorLabel: `${difference} percentage points off`,
      rawAnswer: guess,
      rawCorrect: actual,
    })
  }

  const top = 24
  const height = 132
  const waterHeight = (actual / 100) * height
  const waterTop = top + height - waterHeight
  const actualLineY = top + height - (actual / 100) * height

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
        <svg
          viewBox="0 0 160 180"
          className="h-full max-h-[24rem] w-full"
          role="img"
          aria-label="A transparent container partially filled with water"
        >
          <rect
            x="42"
            y={top}
            width="76"
            height={height}
            rx="3"
            className="fill-elevated stroke-border"
            strokeWidth="2"
          />
          <rect
            x="45"
            y={waterTop}
            width="70"
            height={Math.max(0, waterHeight)}
            className="fill-water/65"
          />
          <rect
            x="45"
            y={waterTop}
            width="70"
            height="1.5"
            className="fill-water"
          />
          <line
            x1="42"
            y1={top + height}
            x2="118"
            y2={top + height}
            className="stroke-border"
            strokeWidth="2"
          />
          <line
            x1="46"
            y1={top + 8}
            x2="52"
            y2={top + 8}
            className="stroke-piece-white/30"
            strokeWidth="1.5"
          />
          {isLocked ? (
            <line
              x1="36"
              y1={actualLineY}
              x2="124"
              y2={actualLineY}
              className="stroke-success"
              strokeWidth="1.4"
              strokeDasharray="4 3"
            />
          ) : null}
          <text
            x="80"
            y="174"
            textAnchor="middle"
            className="fill-muted font-mono"
            fontSize="4.5"
          >
            transparent container
          </text>
        </svg>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Estimated fill
          </span>
          <span className="font-mono text-sm font-semibold text-fg">{guess}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={guess}
          disabled={isLocked}
          onChange={(event) => setGuess(Number(event.target.value))}
          className="range mt-3"
          aria-label="Estimated water level percentage"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            The container is rectangular, so fill height equals fill volume.
          </p>
          <Button onClick={submit} disabled={isLocked} size="sm">
            Submit level
          </Button>
        </div>
      </div>
    </div>
  )
}

export const waterLevelGame: GameDefinition = {
  id: 'water-level',
  name: 'Water Level',
  description: 'Estimate how full a transparent container is.',
  instructions: [
    'A rectangular container is partially filled with water.',
    'Estimate the percentage of the container that is filled.',
    'Submit to compare your estimate with the true volume fraction.',
  ],
  category: 'Quantity',
  difficulty: 'Easy',
  estimatedSeconds: 25,
  rounds: 1,
  icon: Droplets,
  component: WaterLevelGame,
}
