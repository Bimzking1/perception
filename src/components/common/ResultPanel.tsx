import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { GameDefinition, RoundResult } from '../../types'
import { formatAccuracy, gradeFor } from '../../lib/utils'
import { Button } from './Button'
import { GradeBadge } from './GradeBadge'

interface ResultPanelProps {
  game: GameDefinition
  result: RoundResult
  round: number
  onContinue: () => void
  continueLabel: string
}

export function ResultPanel({
  game,
  result,
  round,
  onContinue,
  continueLabel,
}: ResultPanelProps) {
  const grade = gradeFor(result.accuracy)

  return (
    <div className="animate-fade-up rounded-2xl border border-accent/30 bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        <CheckCircle2 size={14} />
        {game.rounds > 1 ? `Round ${round} of ${game.rounds} complete` : 'Round complete'}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <GradeBadge grade={grade} size="lg" />
        <div>
          <p className="font-mono text-3xl font-semibold tracking-tight text-fg">
            {formatAccuracy(result.accuracy)}
          </p>
          <p className="mt-0.5 text-xs uppercase tracking-[0.16em] text-muted">Accuracy</p>
        </div>
      </div>

      {result.note ? (
        <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-xs font-medium text-accent">
          {result.note}
        </p>
      ) : null}

      <dl className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted">Your answer</dt>
          <dd className="text-right font-mono font-semibold text-fg">{result.answerLabel}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted">Correct</dt>
          <dd className="text-right font-mono font-semibold text-success">{result.correctLabel}</dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted">Error</dt>
          <dd className="text-right font-mono text-muted">{result.errorLabel}</dd>
        </div>
      </dl>

      <Button className="mt-5 w-full" onClick={onContinue}>
        {continueLabel}
        <ArrowRight size={15} />
      </Button>
    </div>
  )
}
