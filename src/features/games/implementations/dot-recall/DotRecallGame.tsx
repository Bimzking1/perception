import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { Brain } from 'lucide-react'
import type { GameComponentProps, Difficulty, GameDefinition } from '../../../../types'
import { accuracyFromError, cn } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'
import { Button } from '../../../../components/common/Button'

interface Point {
  x: number
  y: number
}

function durationFor(difficulty: Difficulty): number {
  if (difficulty === 'Easy') return 1400
  if (difficulty === 'Hard') return 700
  return 1000
}

function DotRecallGame({ seed, difficulty, locked, onComplete }: GameComponentProps) {
  const target = useMemo<Point>(() => {
    const rng = createRng(`dot-recall:${seed}`)
    return { x: rng.between(0.12, 0.88), y: rng.between(0.12, 0.88) }
  }, [seed])

  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize')
  const [guess, setGuess] = useState<Point | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted
  const visibleFor = durationFor(difficulty)

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('recall'), visibleFor)
    return () => window.clearTimeout(timer)
  }, [visibleFor])

  const submit = () => {
    if (isLocked || !guess) return
    const distance = Math.hypot(guess.x - target.x, guess.y - target.y) / Math.SQRT2
    setSubmitted(true)
    onComplete({
      accuracy: accuracyFromError(distance, 0.35),
      answerLabel: `${Math.round(guess.x * 100)}%, ${Math.round(guess.y * 100)}%`,
      correctLabel: `${Math.round(target.x * 100)}%, ${Math.round(target.y * 100)}%`,
      errorLabel: `${(distance * 100).toFixed(1)}% of diagonal`,
      rawAnswer: `${Math.round(guess.x * 100)},${Math.round(guess.y * 100)}`,
      rawCorrect: `${Math.round(target.x * 100)},${Math.round(target.y * 100)}`,
    })
  }

  const handleClick = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (isLocked || phase !== 'recall') return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    setGuess({ x, y })
  }

  const moveGuess = (dx: number, dy: number) => {
    if (isLocked || phase !== 'recall') return
    setGuess((current) => {
      const base = current ?? { x: 0.5, y: 0.5 }
      return {
        x: Math.min(0.98, Math.max(0.02, base.x + dx)),
        y: Math.min(0.98, Math.max(0.02, base.y + dy)),
      }
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
        <svg
          viewBox="0 0 100 100"
          className={cn(
            'h-full max-h-[26rem] w-full touch-none rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
            phase === 'recall' && !isLocked && 'cursor-crosshair',
          )}
          onClick={handleClick}
          tabIndex={0}
          role="application"
          aria-label="Recall area. Click or use arrow keys to place your marker."
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0.05 : 0.015
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
            <pattern id="dot-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" className="fill-none stroke-border" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#dot-grid)" />
          <line x1="50" y1="0" x2="50" y2="100" className="stroke-border" strokeWidth="0.25" />
          <line x1="0" y1="50" x2="100" y2="50" className="stroke-border" strokeWidth="0.25" />

          {phase === 'memorize' ? (
            <g>
              <circle cx={target.x * 100} cy={target.y * 100} r="7" className="fill-accent/20 animate-ring-pulse" />
              <circle cx={target.x * 100} cy={target.y * 100} r="3.1" className="fill-accent" />
            </g>
          ) : null}

          {isLocked ? (
            <g>
              <line
                x1={target.x * 100}
                y1={target.y * 100}
                x2={(guess?.x ?? target.x) * 100}
                y2={(guess?.y ?? target.y) * 100}
                className="stroke-muted"
                strokeWidth="0.5"
                strokeDasharray="1.5 1.5"
              />
              <circle
                cx={target.x * 100}
                cy={target.y * 100}
                r="3"
                className="fill-success"
              />
              {guess ? (
                <g>
                  <circle
                    cx={guess.x * 100}
                    cy={guess.y * 100}
                    r="2.4"
                    className="fill-accent"
                  />
                  <circle
                    cx={guess.x * 100}
                    cy={guess.y * 100}
                    r="5"
                    className="fill-none stroke-accent/50"
                    strokeWidth="0.5"
                  />
                </g>
              ) : null}
            </g>
          ) : guess ? (
            <g>
              <circle cx={guess.x * 100} cy={guess.y * 100} r="2.4" className="fill-accent" />
              <circle
                cx={guess.x * 100}
                cy={guess.y * 100}
                r="5"
                className="fill-none stroke-accent/50"
                strokeWidth="0.5"
              />
            </g>
          ) : null}
        </svg>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        {phase === 'memorize' ? (
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium uppercase tracking-[0.16em] text-muted">Memorize</span>
              <span className="font-mono text-accent">{(visibleFor / 1000).toFixed(1)}s</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-accent animate-draw-x"
                style={{ animationDuration: `${visibleFor}ms` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-fg">Where was the dot?</p>
              <p className="mt-1 text-xs text-muted">
                Click the field to place your marker. Adjust it before submitting.
              </p>
            </div>
            <Button onClick={submit} disabled={isLocked || !guess} size="sm">
              Submit position
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export const dotRecallGame: GameDefinition = {
  id: 'dot-recall',
  name: 'Dot Recall',
  description: 'Memorize a single dot, then place it back exactly.',
  instructions: [
    'A dot appears briefly at a random position.',
    'When it disappears, click where you remember it was.',
    'Scoring uses the normalized distance between your marker and the true position.',
  ],
  category: 'Memory',
  difficulty: 'Medium',
  estimatedSeconds: 25,
  rounds: 1,
  icon: Brain,
  component: DotRecallGame,
}
