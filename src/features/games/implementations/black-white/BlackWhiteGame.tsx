import { useEffect, useMemo, useState } from 'react'
import { Contrast } from 'lucide-react'
import type { Difficulty, GameComponentProps, GameDefinition } from '../../../../types'
import { cn } from '../../../../lib/utils'
import { createRng } from '../../../../lib/rng'

interface Piece {
  x: number
  y: number
  r: number
  color: 'black' | 'white'
  shape: 'circle' | 'square'
}

function durationFor(difficulty: Difficulty): number {
  if (difficulty === 'Easy') return 1600
  if (difficulty === 'Hard') return 900
  return 1200
}

function generatePieces(seed: string, difficulty: Difficulty): Piece[] {
  const rng = createRng(`black-white:${seed}`)
  const total = difficulty === 'Hard' ? rng.int(30, 40) : rng.int(22, 34)
  const gap = difficulty === 'Hard' ? rng.int(1, 2) : rng.int(1, 3)
  const blackMajority = rng.bool()
  const black = Math.floor((total + (blackMajority ? gap : -gap)) / 2)
  const white = total - black
  const colors: Array<'black' | 'white'> = [
    ...Array.from({ length: black }, () => 'black' as const),
    ...Array.from({ length: white }, () => 'white' as const),
  ]
  const shuffled = rng.shuffle(colors)

  const pieces: Piece[] = []
  let attempts = 0
  while (pieces.length < shuffled.length && attempts < 1200) {
    attempts += 1
    const r = rng.between(2.4, 4)
    const candidate: Piece = {
      x: rng.between(7, 93),
      y: rng.between(7, 93),
      r,
      color: shuffled[pieces.length] ?? 'black',
      shape: rng.pick(['circle', 'square'] as const),
    }
    const overlaps = pieces.some((piece) => {
      const dx = piece.x - candidate.x
      const dy = piece.y - candidate.y
      return Math.hypot(dx, dy) < piece.r + candidate.r + 0.7
    })
    if (!overlaps) pieces.push(candidate)
  }

  return pieces
}

function BlackWhiteGame({ seed, difficulty, locked, onComplete }: GameComponentProps) {
  const pieces = useMemo(() => generatePieces(seed, difficulty), [seed, difficulty])
  const [phase, setPhase] = useState<'memorize' | 'choose'>('memorize')
  const [submitted, setSubmitted] = useState(false)
  const isLocked = locked || submitted
  const visibleFor = durationFor(difficulty)

  const counts = useMemo(() => {
    const black = pieces.filter((piece) => piece.color === 'black').length
    return { black, white: pieces.length - black }
  }, [pieces])
  const majority = counts.black > counts.white ? 'Black' : 'White'

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('choose'), visibleFor)
    return () => window.clearTimeout(timer)
  }, [visibleFor])

  const choose = (choice: 'Black' | 'White') => {
    if (isLocked || phase !== 'choose') return
    const correct = choice === majority
    setSubmitted(true)
    onComplete({
      accuracy: correct ? 100 : 0,
      answerLabel: choice,
      correctLabel: majority,
      errorLabel: correct ? 'Correct' : 'Incorrect',
      note: `Black ${counts.black} · White ${counts.white}`,
      rawAnswer: choice,
      rawCorrect: majority,
    })
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface p-2 sm:p-4">
        <svg
          viewBox="0 0 100 100"
          className="h-full max-h-[26rem] w-full"
          role="img"
          aria-label="A collection of black and white objects"
        >
          {phase === 'memorize' || isLocked
            ? pieces.map((piece, index) => {
                const size = piece.r * 1.85
                const className = cn(
                  piece.color === 'black'
                    ? 'fill-piece-black stroke-piece-white/30'
                    : 'fill-piece-white stroke-piece-black/25',
                )
                if (piece.shape === 'square') {
                  return (
                    <rect
                      key={index}
                      x={piece.x - size / 2}
                      y={piece.y - size / 2}
                      width={size}
                      height={size}
                      rx="0.4"
                      className={className}
                      strokeWidth="0.35"
                      opacity={isLocked ? 0.25 : 1}
                    />
                  )
                }
                return (
                  <circle
                    key={index}
                    cx={piece.x}
                    cy={piece.y}
                    r={piece.r}
                    className={className}
                    strokeWidth="0.35"
                    opacity={isLocked ? 0.25 : 1}
                  />
                )
              })
            : null}
          {phase === 'choose' && !isLocked ? (
            <text
              x="50"
              y="52"
              textAnchor="middle"
              className="fill-muted font-mono"
              fontSize="5"
            >
              which color had more?
            </text>
          ) : null}
        </svg>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        {phase === 'memorize' ? (
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium uppercase tracking-[0.16em] text-muted">Observe</span>
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
          <div>
            <p className="text-center text-sm font-semibold text-fg">Which color had more objects?</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => choose('Black')}
                disabled={isLocked}
                className="flex h-20 items-center justify-center gap-2 rounded-xl border border-border bg-piece-black text-piece-white transition-all hover:border-accent/60 hover:scale-[1.01] disabled:opacity-50"
              >
                <span className="h-3 w-3 rounded-full bg-piece-white" />
                <span className="text-sm font-semibold">Black</span>
              </button>
              <button
                type="button"
                onClick={() => choose('White')}
                disabled={isLocked}
                className="flex h-20 items-center justify-center gap-2 rounded-xl border border-border bg-piece-white text-piece-black transition-all hover:border-accent/60 hover:scale-[1.01] disabled:opacity-50"
              >
                <span className="h-3 w-3 rounded-full bg-piece-black" />
                <span className="text-sm font-semibold">White</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const blackWhiteGame: GameDefinition = {
  id: 'black-white',
  name: 'Black or White',
  description: 'Which color held the majority? Trust your visual memory.',
  instructions: [
    'A mixed field of black and white shapes appears briefly.',
    'When it disappears, decide which color had more objects.',
    'The gap is intentionally small. Each round is scored correct or incorrect.',
  ],
  category: 'Memory',
  difficulty: 'Medium',
  estimatedSeconds: 20,
  rounds: 3,
  icon: Contrast,
  component: BlackWhiteGame,
}
