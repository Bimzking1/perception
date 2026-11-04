import { useMemo, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import type { Difficulty, GameComponentProps, GameDefinition } from '../../../../types'
import { accuracyFromError, clamp, cn } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

const FRACTIONS: Record<Difficulty, ReadonlyArray<readonly [number, number]>> = {
  Easy: [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
  ],
  Medium: [
    [2, 5],
    [3, 5],
    [3, 8],
    [5, 8],
    [2, 7],
    [5, 7],
  ],
  Hard: [
    [3, 7],
    [4, 9],
    [5, 12],
    [7, 11],
    [5, 8],
    [7, 10],
  ],
}

function PickFractionGame({ seed, difficulty, locked, onComplete }: GameComponentProps) {
  const challenge = useMemo(() => {
    const rng = createRng(`fraction:${seed}`)
    const options = FRACTIONS[difficulty]
    const [numerator, denominator] = rng.pick(options)
    return { numerator, denominator, value: numerator / denominator }
  }, [seed, difficulty])

  const [value, setValue] = useState(0.5)
  const [dragging, setDragging] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted

  const updateFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isLocked) return
    const rect = event.currentTarget.getBoundingClientRect()
    setValue(clamp((event.clientX - rect.left) / rect.width, 0, 1))
  }

  const submit = () => {
    if (isLocked) return
    const difference = Math.abs(value - challenge.value)
    setSubmitted(true)
    onComplete({
      accuracy: accuracyFromError(difference, 0.2),
      answerLabel: `${(value * 100).toFixed(1)}%`,
      correctLabel: `${(challenge.value * 100).toFixed(1)}% (${challenge.numerator}/${challenge.denominator})`,
      errorLabel: `${(difference * 100).toFixed(1)} points off`,
      rawAnswer: Number((value * 100).toFixed(1)),
      rawCorrect: Number((challenge.value * 100).toFixed(1)),
    })
  }

  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Selected portion</p>
        <p className="mt-2 text-2xl font-bold text-fg">
          Select{' '}
          <span className="font-mono text-accent">
            {challenge.numerator}/{challenge.denominator}
          </span>{' '}
          from the left
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
        <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted">
          <span>Start</span>
          <span>End</span>
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Fraction marker"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value * 100)}
          aria-valuetext={`${Math.round(value * 100)} percent`}
          onPointerDown={(event) => {
            if (isLocked) return
            event.currentTarget.setPointerCapture(event.pointerId)
            setDragging(true)
            updateFromPointer(event)
          }}
          onPointerMove={(event) => {
            if (dragging) updateFromPointer(event)
          }}
          onPointerUp={(event) => {
            if (dragging) {
              event.currentTarget.releasePointerCapture(event.pointerId)
              setDragging(false)
            }
          }}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={(event) => {
            if (isLocked) return
            const step = event.shiftKey ? 0.05 : 0.01
            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
              event.preventDefault()
              setValue((current) => clamp(current - step, 0, 1))
            }
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
              event.preventDefault()
              setValue((current) => clamp(current + step, 0, 1))
            }
          }}
          className={cn(
            'relative mt-3 h-24 touch-none select-none overflow-hidden rounded-xl border border-border bg-elevated outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
            !isLocked && 'cursor-ew-resize',
          )}
        >
          <div
            className="absolute inset-y-0 left-0 bg-accent/25 transition-[width] duration-75"
            style={{ width: `${value * 100}%` }}
          />
          <div
            className="absolute inset-y-0 w-1 -translate-x-1/2 bg-accent"
            style={{ left: `${value * 100}%` }}
          >
            <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-card shadow-lg" />
          </div>
          {isLocked ? (
            <div
              className="absolute inset-y-0 w-0.5 border-l-2 border-dashed border-success"
              style={{ left: `${challenge.value * 100}%` }}
            />
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <span className="rounded-md bg-card/80 px-2 py-1 font-mono text-[0.65rem] text-muted backdrop-blur">
              drag to set the boundary
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">
            No percentage markings are shown while you decide.
          </p>
          <Button onClick={submit} disabled={isLocked} size="sm">
            Submit boundary
          </Button>
        </div>
      </div>
    </div>
  )
}

export const pickFractionGame: GameDefinition = {
  id: 'pick-fraction',
  name: 'Pick X/X',
  description: 'Mark a fraction of a block purely by proportion.',
  instructions: [
    'A fraction such as 3/5 is requested.',
    'Drag the marker to the point where that fraction of the block ends.',
    'Submit to reveal the true boundary. Distance from it determines your score.',
  ],
  category: 'Proportion',
  difficulty: 'Medium',
  estimatedSeconds: 25,
  rounds: 1,
  icon: SlidersHorizontal,
  component: PickFractionGame,
}
