import { useRef, useState } from 'react'
import { Timer } from 'lucide-react'
import type { GameComponentProps, GameDefinition } from '../../../../types'
import { accuracyFromError, cn } from '../../../../lib/utils'
import { Button } from '../../../../components/common/Button'

const TARGET_MS = 5000
const JUST_IN_TIME_MS = 250
const ZERO_AT_MS = 2000

function CountdownGame({ locked, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready')
  const startRef = useRef<number | null>(null)

  const start = () => {
    if (locked || phase === 'running') return
    startRef.current = performance.now()
    setPhase('running')
  }

  const stop = () => {
    if (locked || phase !== 'running' || startRef.current === null) return
    const elapsed = performance.now() - startRef.current
    const error = elapsed - TARGET_MS
    const accuracy = accuracyFromError(Math.abs(error), ZERO_AT_MS)
    const note =
      Math.abs(error) <= JUST_IN_TIME_MS ? 'Just in time' : error < 0 ? 'Too early' : 'Too late'

    setPhase('done')
    onComplete({
      accuracy,
      answerLabel: `${(elapsed / 1000).toFixed(3)} s`,
      correctLabel: '5.000 s',
      errorLabel: `${error >= 0 ? '+' : ''}${Math.round(error)} ms`,
      note,
      rawAnswer: Math.round(elapsed),
      rawCorrect: TARGET_MS,
    })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 py-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Target duration</p>
        <p className="mt-2 font-mono text-4xl font-semibold text-fg">5.000 s</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Start the clock, then click the dial when your internal timer reaches five seconds.
        </p>
      </div>

      <div className="relative flex items-center justify-center">
        {phase === 'running' ? (
          <>
            <span className="pointer-events-none absolute h-64 w-64 rounded-full border border-accent/20 animate-ring-pulse" />
            <span className="pointer-events-none absolute h-80 w-80 rounded-full border border-accent/10 animate-ring-pulse [animation-delay:600ms]" />
          </>
        ) : null}

        {phase === 'ready' ? (
          <Button size="lg" className="h-14 min-w-44" onClick={start}>
            <Timer size={17} />
            Start timer
          </Button>
        ) : (
          <button
            type="button"
            onClick={stop}
            disabled={locked || phase === 'done'}
            className={cn(
              'relative flex h-60 w-60 flex-col items-center justify-center rounded-full border text-center outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent/70 sm:h-64 sm:w-64',
              phase === 'running'
                ? 'border-accent/50 bg-accent-soft text-fg hover:scale-[1.015] hover:border-accent active:scale-[0.99]'
                : 'border-border bg-elevated text-muted',
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {phase === 'running' ? 'No clock' : 'Measured'}
            </span>
            <span className="mt-3 text-2xl font-bold tracking-tight text-fg">
              {phase === 'running' ? 'Click now' : 'Recorded'}
            </span>
            <span className="mt-2 max-w-36 text-xs leading-relaxed text-muted">
              {phase === 'running'
                ? 'Trust your instincts'
                : 'Check the result panel for your time'}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export const countdownGame: GameDefinition = {
  id: 'countdown',
  name: 'Five Second Countdown',
  description: 'Hit exactly five seconds without a visible clock.',
  instructions: [
    'Press Start to begin an invisible five-second timer.',
    'Click the dial when you believe exactly five seconds have passed.',
    'Closer to 5.000 seconds means a higher accuracy score.',
  ],
  category: 'Time',
  difficulty: 'Easy',
  estimatedSeconds: 20,
  rounds: 1,
  icon: Timer,
  component: CountdownGame,
}
