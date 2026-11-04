import { useMemo, useState } from 'react'
import { Columns2 } from 'lucide-react'
import type { Difficulty, GameComponentProps, GameDefinition } from '../../../../types'
import { cn } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'

interface BoxShape {
  width: number
  height: number
  x: number
  y: number
  area: number
}

interface Boxes {
  left: BoxShape
  right: BoxShape
  leftArea: number
  rightArea: number
}

function differenceFor(difficulty: Difficulty): number {
  if (difficulty === 'Easy') return 0.16
  if (difficulty === 'Hard') return 0.055
  return 0.1
}

function generateBoxes(seed: string, difficulty: Difficulty): Boxes {
  const rng = createRng(`box:${seed}`)
  const baseArea = rng.between(4400, 7600)
  const difference = differenceFor(difficulty)
  const leftIsBigger = rng.bool()
  const leftArea = leftIsBigger ? baseArea * (1 + difference) : baseArea
  const rightArea = leftIsBigger ? baseArea : baseArea * (1 + difference)

  const build = (area: number): BoxShape => {
    const aspect = rng.between(0.72, 1.42)
    const height = Math.sqrt(area / aspect)
    const width = aspect * height
    return { width, height, x: 0, y: 0, area }
  }

  const left = build(leftArea)
  const right = build(rightArea)
  const scale = Math.min(
    112 / Math.max(left.width, right.width),
    112 / Math.max(left.height, right.height),
  )

  left.width *= scale
  left.height *= scale
  right.width *= scale
  right.height *= scale
  left.x = 85
  left.y = 82
  right.x = 235
  right.y = 82

  return { left, right, leftArea, rightArea }
}

function ComparisonBox({
  box,
  label,
  locked,
  onChoose,
}: {
  box: BoxShape
  label: 'Left' | 'Right'
  locked: boolean
  onChoose: () => void
}) {
  return (
    <g
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label={`Choose the ${label.toLowerCase()} box`}
      aria-disabled={locked}
      onClick={() => {
        if (!locked) onChoose()
      }}
      onKeyDown={(event) => {
        if (locked) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onChoose()
        }
      }}
      className={cn('outline-none', !locked && 'cursor-pointer')}
    >
      <rect
        x={box.x - box.width / 2}
        y={box.y - box.height / 2}
        width={box.width}
        height={box.height}
        rx="4"
        className={cn(
          'fill-accent/15 stroke-accent/70 transition-[fill,stroke] duration-150 group-hover:fill-accent/25',
          !locked && 'hover:fill-accent/25 focus:fill-accent/25',
          locked && 'opacity-70',
        )}
        strokeWidth="1.6"
      />
      <text
        x={box.x}
        y={box.y + 2}
        textAnchor="middle"
        className="pointer-events-none fill-fg font-mono font-semibold"
        fontSize="5"
      >
        {label}
      </text>
      {locked ? (
        <text
          x={box.x}
          y={160 - 4}
          textAnchor="middle"
          className="pointer-events-none fill-muted font-mono"
          fontSize="3.8"
        >
          {Math.round(box.area).toLocaleString()} u²
        </text>
      ) : null}
    </g>
  )
}

function BoxComparisonGame({ seed, difficulty, locked, onComplete }: GameComponentProps) {
  const boxes = useMemo(() => generateBoxes(seed, difficulty), [seed, difficulty])
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted
  const leftIsBigger = boxes.leftArea > boxes.rightArea
  const answer = leftIsBigger ? 'Left' : 'Right'

  const choose = (choice: 'Left' | 'Right') => {
    if (isLocked) return
    const correct = choice === answer
    setSubmitted(true)
    onComplete({
      accuracy: correct ? 100 : 0,
      answerLabel: choice,
      correctLabel: answer,
      errorLabel: correct ? 'Correct' : 'Incorrect',
      note: `Left ${Math.round(boxes.leftArea).toLocaleString()} · Right ${Math.round(
        boxes.rightArea,
      ).toLocaleString()} u²`,
      rawAnswer: choice,
      rawCorrect: answer,
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
        <svg
          viewBox="0 0 320 160"
          className="h-full max-h-[24rem] w-full"
          role="group"
          aria-label="Two boxes of similar area"
        >
          <line x1="160" y1="14" x2="160" y2="146" className="stroke-border" strokeWidth="0.8" />
          <ComparisonBox
            box={boxes.left}
            label="Left"
            locked={isLocked}
            onChoose={() => choose('Left')}
          />
          <ComparisonBox
            box={boxes.right}
            label="Right"
            locked={isLocked}
            onChoose={() => choose('Right')}
          />
        </svg>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-fg">Which box has the larger area?</p>
            <p className="mt-1 text-xs text-muted">
              Both shapes are fully visible. Click a box to lock in your answer.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => choose('Left')}
              disabled={isLocked}
              className="h-9 rounded-lg border border-border bg-elevated px-4 text-xs font-semibold text-fg transition-colors hover:border-accent/60 disabled:opacity-40"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => choose('Right')}
              disabled={isLocked}
              className="h-9 rounded-lg border border-border bg-elevated px-4 text-xs font-semibold text-fg transition-colors hover:border-accent/60 disabled:opacity-40"
            >
              Right
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export const boxComparisonGame: GameDefinition = {
  id: 'box-comparison',
  name: 'Box Comparison',
  description: 'Pick the larger area when the difference is barely there.',
  instructions: [
    'Two boxes with similar areas appear side by side.',
    'Choose the box that you believe has the larger area.',
    'Each round is scored correct or incorrect. The area is calculated exactly.',
  ],
  category: 'Geometry',
  difficulty: 'Hard',
  estimatedSeconds: 20,
  rounds: 3,
  icon: Columns2,
  component: BoxComparisonGame,
}
