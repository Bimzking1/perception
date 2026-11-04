import { useMemo, useState } from 'react'
import { RotateCw } from 'lucide-react'
import type { GameComponentProps, GameDefinition } from '../../../../types'
import { accuracyFromError, angularDifference, cn } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

function RotatedShape({
  angle,
  correctAngle,
  showCorrect = false,
  className,
}: {
  angle: number
  correctAngle?: number
  showCorrect?: boolean
  className?: string
}) {
  return (
    <svg viewBox="0 0 100 100" className={cn('h-full w-full', className)} aria-hidden="true">
      <circle cx="50" cy="50" r="46" className="fill-elevated stroke-border" strokeWidth="0.8" />
      {showCorrect && correctAngle !== undefined ? (
        <g transform={`rotate(${correctAngle} 50 50)`} opacity="0.55">
          <path
            d="M50 13 L70 50 L58 46 L58 82 L42 82 L42 46 L30 50 Z"
            className="fill-none stroke-success"
            strokeWidth="1.4"
            strokeDasharray="3 2"
          />
        </g>
      ) : null}
      <g transform={`rotate(${angle} 50 50)`}>
        <path
          d="M50 13 L70 50 L58 46 L58 82 L42 82 L42 46 L30 50 Z"
          className="fill-accent stroke-accent"
          strokeWidth="1"
        />
        <circle cx="50" cy="23" r="3" className="fill-surface" />
      </g>
      <circle cx="50" cy="50" r="2" className="fill-fg" />
    </svg>
  )
}

function RotationGame({ seed, locked, onComplete }: GameComponentProps) {
  const target = useMemo(() => {
    const rng = createRng(`rotation:${seed}`)
    return rng.int(12, 348)
  }, [seed])

  const [guess, setGuess] = useState(160)
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted

  const submit = () => {
    if (isLocked) return
    const difference = angularDifference(target, guess)
    setSubmitted(true)
    onComplete({
      accuracy: accuracyFromError(difference, 60),
      answerLabel: `${guess}°`,
      correctLabel: `${target}°`,
      errorLabel: `${difference.toFixed(1)}° off`,
      rawAnswer: guess,
      rawCorrect: target,
    })
  }

  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div className="grid flex-1 grid-cols-2 gap-3 sm:gap-5">
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Target rotation
          </p>
          <div className="mx-auto mt-2 aspect-square w-full max-w-[19rem] flex-1">
            <RotatedShape angle={target} />
          </div>
        </div>
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Your rotation
          </p>
          <div className="mx-auto mt-2 aspect-square w-full max-w-[19rem] flex-1">
            <RotatedShape
              angle={guess}
              correctAngle={target}
              showCorrect={isLocked}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Match the orientation
          </span>
          <span className="font-mono text-sm font-semibold text-fg">{guess}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={359}
          step={1}
          value={guess}
          disabled={isLocked}
          onChange={(event) => setGuess(Number(event.target.value))}
          className="range mt-3"
          aria-label="Estimated rotation in degrees"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">Rotate the shape until it matches the target.</p>
          <Button onClick={submit} disabled={isLocked} size="sm">
            Submit rotation
          </Button>
        </div>
      </div>
    </div>
  )
}

export const rotationGame: GameDefinition = {
  id: 'rotation',
  name: 'Rotation',
  description: 'Match the orientation of a rotated asymmetric shape.',
  instructions: [
    'A shape appears at a random rotation.',
    'Adjust your copy with the slider until it matches the target orientation.',
    'Scoring uses the shortest angular difference between the two rotations.',
  ],
  category: 'Spatial',
  difficulty: 'Medium',
  estimatedSeconds: 30,
  rounds: 1,
  icon: RotateCw,
  component: RotationGame,
}
