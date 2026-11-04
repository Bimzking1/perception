import { useMemo, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'
import type { GameComponentProps, GameDefinition } from '../../../../types'
import { accuracyFromRelativeError } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

const MAX_LENGTH = 140

interface Points {
  a: { x: number; y: number }
  b: { x: number; y: number }
  distance: number
}

function generatePoints(seed: string): Points {
  const rng = createRng(`distance:${seed}`)
  const a = { x: rng.between(18, 74), y: rng.between(18, 60) }
  let b = { x: 0, y: 0 }
  let distance = 0

  for (let attempt = 0; attempt < 80; attempt += 1) {
    b = { x: rng.between(84, 144), y: rng.between(16, 62) }
    distance = Math.hypot(b.x - a.x, b.y - a.y)
    if (distance >= 38 && distance <= 122) break
  }

  return { a, b, distance }
}

function DistanceGame({ seed, locked, onComplete }: GameComponentProps) {
  const points = useMemo(() => generatePoints(seed), [seed])
  const [length, setLength] = useState(72)
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted

  const submit = () => {
    if (isLocked) return
    const relativeError = Math.abs(length - points.distance) / Math.max(points.distance, 1)
    setSubmitted(true)
    onComplete({
      accuracy: accuracyFromRelativeError(relativeError, 0.5),
      answerLabel: `${length.toFixed(0)} units`,
      correctLabel: `${points.distance.toFixed(1)} units`,
      errorLabel: `${(relativeError * 100).toFixed(1)}% relative error`,
      rawAnswer: Number(length.toFixed(1)),
      rawCorrect: Number(points.distance.toFixed(1)),
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
        <svg
          viewBox="0 0 160 100"
          className="h-full max-h-[24rem] w-full"
          role="img"
          aria-label="Two points whose distance you must estimate"
        >
          {isLocked ? (
            <line
              x1={points.a.x}
              y1={points.a.y}
              x2={points.b.x}
              y2={points.b.y}
              className="stroke-success"
              strokeWidth="1.4"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          ) : null}

          <line
            x1="10"
            y1="87"
            x2={10 + length}
            y2="87"
            className="stroke-accent"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="83"
            x2="10"
            y2="91"
            className="stroke-accent"
            strokeWidth="1.4"
          />
          <line
            x1={10 + length}
            y1="83"
            x2={10 + length}
            y2="91"
            className="stroke-accent"
            strokeWidth="1.4"
          />
          <text x="10" y="97" className="fill-muted font-mono" fontSize="4">
            measuring line
          </text>

          {[points.a, points.b].map((point, index) => (
            <g key={index}>
              <circle cx={point.x} cy={point.y} r="6.5" className="fill-accent/15" />
              <circle
                cx={point.x}
                cy={point.y}
                r="3.4"
                className="fill-accent stroke-surface"
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={point.y - 8}
                textAnchor="middle"
                className="fill-muted font-mono"
                fontSize="4.5"
              >
                {index === 0 ? 'A' : 'B'}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Match the distance
          </span>
          <span className="text-xs text-muted">Drag to resize the measuring line</span>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_LENGTH}
          step={1}
          value={length}
          disabled={isLocked}
          onChange={(event) => setLength(Number(event.target.value))}
          className="range mt-3"
          aria-label="Length of the measuring line"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">Compare the line with the gap between A and B.</p>
          <Button onClick={submit} disabled={isLocked} size="sm">
            Submit distance
          </Button>
        </div>
      </div>
    </div>
  )
}

export const distanceGame: GameDefinition = {
  id: 'distance',
  name: 'Distance',
  description: 'Estimate the invisible gap between two points.',
  instructions: [
    'Two points appear in the field. Study the distance between them.',
    'Drag the measuring line until it matches that distance.',
    'Submit when you are confident. Scoring uses the relative distance error.',
  ],
  category: 'Geometry',
  difficulty: 'Medium',
  estimatedSeconds: 30,
  rounds: 1,
  icon: MoveHorizontal,
  component: DistanceGame,
}
