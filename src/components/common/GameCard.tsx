import { Clock, Play, Repeat2 } from 'lucide-react'
import type { GameDefinition, Grade } from '../../types'
import { cn, formatAccuracy, formatShortDuration, gradeFor } from '../../lib/utils'
import { Button } from './Button'
import { GradeBadge } from './GradeBadge'

const difficultyClasses: Record<GameDefinition['difficulty'], string> = {
  Easy: 'bg-success-soft text-success',
  Medium: 'bg-warning-soft text-warning',
  Hard: 'bg-danger-soft text-danger',
}

interface GameCardProps {
  game: GameDefinition
  bestScore?: number
  onPlay: (game: GameDefinition) => void
}

export function GameCard({ game, bestScore, onPlay }: GameCardProps) {
  const Icon = game.icon
  const totalSeconds = game.estimatedSeconds * game.rounds

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/45">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-elevated text-accent transition-colors group-hover:bg-accent-soft">
          <Icon size={18} />
        </span>
        <span className="rounded-lg border border-border bg-surface px-2 py-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted">
          {game.category}
        </span>
      </div>

      <h3 className="mt-4 text-base font-bold tracking-tight text-fg">{game.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{game.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            'rounded-md px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em]',
            difficultyClasses[game.difficulty],
          )}
        >
          {game.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-elevated px-2 py-1 text-[0.65rem] font-medium text-muted">
          <Clock size={11} />
          {formatShortDuration(totalSeconds)}
        </span>
        {game.rounds > 1 ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-elevated px-2 py-1 text-[0.65rem] font-medium text-muted">
            <Repeat2 size={11} />
            {game.rounds} rounds
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
            Personal best
          </p>
          {bestScore === undefined ? (
            <p className="mt-1 text-xs text-muted">Not played</p>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <GradeBadge grade={gradeFor(bestScore) as Grade} size="sm" />
              <span className="font-mono text-sm font-semibold text-fg">
                {formatAccuracy(bestScore)}
              </span>
            </div>
          )}
        </div>
        <Button size="sm" onClick={() => onPlay(game)}>
          <Play size={13} />
          Play
        </Button>
      </div>
    </article>
  )
}
