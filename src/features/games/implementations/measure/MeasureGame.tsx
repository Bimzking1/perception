import { useMemo, useState } from 'react'
import { Ruler } from 'lucide-react'
import type { GameComponentProps, GameDefinition } from '../../../../types'
import { accuracyFromRelativeError } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

const MAX_LENGTH = 128

function MeasureGame({ seed, locked, onComplete }: GameComponentProps) {
  const target = useMemo(() => {
    const rng = createRng(`measure:${seed}`)
    return rng.between(42, 116)
  }, [seed])

  const [length, setLength] = useState(76)
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted

  const submit = () => {
    if (isLocked) return
    const relativeError = Math.abs(length - target) / Math.max(target, 1)
    setSubmitted(true)
    onComplete({
      accuracy: accuracyFromRelativeError(relativeError, 0.4),
      answerLabel: `${length.toFixed(0)} units`,
      correctLabel: `${target.toFixed(1)} units`,
      errorLabel: `${Math.abs(length - target).toFixed(1)} units off`,
      rawAnswer: Number(length.toFixed(1)),
      rawCorrect: Number(target.toFixed(1)),
    })
  }

  const objectLeft = 80 - target / 2

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
        <svg
          viewBox="0 0 160 100"
          className="h-full max-h-[24rem] w-full"
          role="img"
          aria-label="An object of unknown length"
        >
          <text x="80" y="14" textAnchor="middle" className="fill-muted font-mono" fontSize="4.2">
            object
          </text>
          <line
            x1={objectLeft}
            y1="22"
            x2={objectLeft + target}
            y2="22"
            className="stroke-border"
            strokeWidth="1"
          />
          <line
            x1={objectLeft}
            y1="18"
            x2={objectLeft}
            y2="26"
            className="stroke-border"
            strokeWidth="1"
          />
          <line
            x1={objectLeft + target}
            y1="18"
            x2={objectLeft + target}
            y2="26"
            className="stroke-border"
            strokeWidth="1"
          />
          <rect
            x={objectLeft}
            y="31"
            width={target}
            height="15"
            rx="4"
            className="fill-accent"
          />
          <rect
            x={objectLeft + 5}
            y="35"
            width={Math.max(0, target - 10)}
            height="7"
            rx="3.5"
            className="fill-surface/40"
          />

          <text x="10" y="72" className="fill-muted font-mono" fontSize="4.2">
            your measuring line
          </text>
          <line
            x1="10"
            y1="80"
            x2={10 + length}
            y2="80"
            className="stroke-accent"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <line x1="10" y1="76" x2="10" y2="84" className="stroke-accent" strokeWidth="1.4" />
          <line
            x1={10 + length}
            y1="76"
            x2={10 + length}
            y2="84"
            className="stroke-accent"
            strokeWidth="1.4"
          />
          {isLocked ? (
            <line
              x1={objectLeft}
              y1="93"
              x2={objectLeft + target}
              y2="93"
              className="stroke-success"
              strokeWidth="1.6"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          ) : null}
        </svg>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
            Estimate the object
          </span>
          <span className="text-xs text-muted">No ruler, no markings</span>
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
          aria-label="Length of your measuring line"
        />
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-muted">Drag your measuring line to match the object.</p>
          <Button onClick={submit} disabled={isLocked} size="sm">
            Submit length
          </Button>
        </div>
      </div>
    </div>
  )
}

export const measureGame: GameDefinition = {
  id: 'measure',
  name: 'Measure',
  description: 'Match the length of an object with a bare measuring line.',
  instructions: [
    'An object of unknown length is shown.',
    'Drag the measuring line below until it matches the object.',
    'Submit to reveal the true length. Relative length error determines your score.',
  ],
  category: 'Geometry',
  difficulty: 'Medium',
  estimatedSeconds: 30,
  rounds: 1,
  icon: Ruler,
  component: MeasureGame,
}
