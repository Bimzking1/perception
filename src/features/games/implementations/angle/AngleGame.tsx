import { useMemo, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Triangle } from 'lucide-react'
import type { GameComponentProps, GameDefinition } from '../../../../types'
import { accuracyFromError, angularDifference, cn } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

function angleFromPointer(
  event: ReactPointerEvent<SVGSVGElement>,
  element: SVGSVGElement,
): number {
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const dx = event.clientX - centerX
  const dy = event.clientY - centerY
  const raw = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  return ((raw % 360) + 360) % 360
}

function Dial({
  angle,
  interactive = false,
  correctAngle,
  showCorrect = false,
  onAngleChange,
}: {
  angle: number
  interactive?: boolean
  correctAngle?: number
  showCorrect?: boolean
  onAngleChange?: (angle: number) => void
}) {
  const [dragging, setDragging] = useState(false)

  const update = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || !onAngleChange) return
    onAngleChange(angleFromPointer(event, event.currentTarget))
  }

  return (
    <svg
      viewBox="0 0 200 200"
      className={cn(
        'h-full w-full touch-none select-none',
        interactive && 'cursor-crosshair',
      )}
      onPointerDown={(event) => {
        if (!interactive) return
        event.currentTarget.setPointerCapture(event.pointerId)
        setDragging(true)
        update(event)
      }}
      onPointerMove={(event) => {
        if (dragging) update(event)
      }}
      onPointerUp={(event) => {
        if (dragging) {
          event.currentTarget.releasePointerCapture(event.pointerId)
          setDragging(false)
        }
      }}
      onPointerCancel={() => setDragging(false)}
      role={interactive ? 'slider' : 'img'}
      aria-label={interactive ? 'Drag to rotate your estimate line' : 'Target angle line'}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 359 : undefined}
      aria-valuenow={interactive ? Math.round(angle) : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(event) => {
        if (!interactive || !onAngleChange) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          event.preventDefault()
          onAngleChange((angle - 1 + 360) % 360)
        }
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          event.preventDefault()
          onAngleChange((angle + 1) % 360)
        }
      }}
    >
      <circle cx="100" cy="100" r="94" className="fill-elevated stroke-border" strokeWidth="1" />
      {Array.from({ length: 24 }, (_, index) => (
        <line
          key={index}
          x1="100"
          y1="12"
          x2="100"
          y2={index % 6 === 0 ? '22' : '18'}
          className="stroke-border"
          strokeWidth="1"
          transform={`rotate(${index * 15} 100 100)`}
        />
      ))}
      {showCorrect && correctAngle !== undefined ? (
        <g transform={`rotate(${correctAngle} 100 100)`}>
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            className="stroke-success"
            strokeWidth="3"
            strokeDasharray="6 6"
            strokeLinecap="round"
          />
        </g>
      ) : null}
      <g transform={`rotate(${angle} 100 100)`}>
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="34"
          className={cn('stroke-accent', interactive && 'stroke-[3.5]')}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="100" cy="34" r="4.5" className="fill-accent" />
      </g>
      <circle cx="100" cy="100" r="5" className="fill-fg" />
    </svg>
  )
}

function AngleGame({ seed, locked, onComplete }: GameComponentProps) {
  const target = useMemo(() => {
    const rng = createRng(`angle:${seed}`)
    return Math.round(rng.between(8, 352))
  }, [seed])

  const [guess, setGuess] = useState(180)
  const [submitted, setSubmitted] = useState(false)

  const submit = () => {
    if (locked || submitted) return
    setSubmitted(true)
    const difference = angularDifference(target, guess)
    const accuracy = accuracyFromError(difference, 90)
    onComplete({
      accuracy,
      answerLabel: `${guess.toFixed(0)}°`,
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
            Target line
          </p>
          <div className="mx-auto mt-2 aspect-square w-full max-w-[19rem] flex-1">
            <Dial angle={target} />
          </div>
        </div>
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-surface p-3 sm:p-4">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Your estimate
          </p>
          <div className="mx-auto mt-2 aspect-square w-full max-w-[19rem] flex-1">
            <Dial
              angle={guess}
              interactive={!locked && !submitted}
              correctAngle={target}
              showCorrect={locked || submitted}
              onAngleChange={setGuess}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Rotate the line
          </span>
          <span className="font-mono text-sm font-semibold text-fg">{guess.toFixed(0)}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={359}
          step={1}
          value={guess}
          disabled={locked || submitted}
          onChange={(event) => setGuess(Number(event.target.value))}
          className="range mt-3"
          aria-label="Estimated angle in degrees"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">Drag the dial or fine-tune with the slider.</p>
          <Button onClick={submit} disabled={locked || submitted} size="sm">
            Submit angle
          </Button>
        </div>
      </div>
    </div>
  )
}

export const angleGame: GameDefinition = {
  id: 'angle',
  name: 'Angle',
  description: 'Recreate a line’s orientation without a protractor.',
  instructions: [
    'Study the target line in the left dial.',
    'Drag your estimate dial or use the slider to match its orientation.',
    'Submit when your line feels aligned. Circular angles are scored by the shortest difference.',
  ],
  category: 'Geometry',
  difficulty: 'Medium',
  estimatedSeconds: 30,
  rounds: 1,
  icon: Triangle,
  component: AngleGame,
}
