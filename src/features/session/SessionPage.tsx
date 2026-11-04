import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Clock,
  Flag,
  Layers,
  Play,
  Target,
  X,
} from 'lucide-react'
import type { ActiveSession, GameResult, RoundResult } from '../../types'
import { getGame } from '../games/registry'
import { useSessionStore } from '../sessions/sessionStore'
import { aggregateRounds } from '../sessions/scoring'
import { Button, buttonClasses } from '../../components/common/Button'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { ProgressIndicator } from '../../components/common/ProgressIndicator'
import { ResultPanel } from '../../components/common/ResultPanel'
import {
  cn,
  formatShortDuration,
  gradeFor,
  modeLabel,
  nowMs,
} from '../../lib/utils'

function SessionRunner({ session }: { session: ActiveSession }) {
  const navigate = useNavigate()
  const recordGameResult = useSessionStore((state) => state.recordGameResult)
  const abandonSession = useSessionStore((state) => state.abandonSession)

  const game = getGame(session.gameIds[session.currentIndex] ?? '')
  const [stage, setStage] = useState<'intro' | 'play'>('intro')
  const [roundIndex, setRoundIndex] = useState(0)
  const [rounds, setRounds] = useState<RoundResult[]>([])
  const [currentResult, setCurrentResult] = useState<RoundResult | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [startedAt, setStartedAt] = useState<number | null>(null)

  const progress = Math.min(session.results.length, session.gameIds.length)

  const totalSeconds = useMemo(
    () =>
      session.gameIds.reduce((sum, id) => {
        const definition = getGame(id)
        return sum + (definition ? definition.estimatedSeconds * definition.rounds : 0)
      }, 0),
    [session.gameIds],
  )

  if (!game) {
    return (
      <div className="container-wide py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-bold text-fg">This game is unavailable</h1>
          <p className="mt-2 text-sm text-muted">
            The session contains a game that is no longer registered. Clear it to start again.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              abandonSession()
              navigate('/games')
            }}
          >
            Clear session
          </Button>
        </div>
      </div>
    )
  }

  const beginGame = () => {
    setStage('play')
    setStartedAt(nowMs())
    setRoundIndex(0)
    setRounds([])
    setCurrentResult(null)
  }

  const handleRoundComplete = (result: RoundResult) => {
    if (currentResult || advancing) return
    setCurrentResult(result)
    setRounds((current) => (current.length === roundIndex ? [...current, result] : current))
  }

  const handleContinue = () => {
    if (!currentResult || advancing) return
    const isLastRound = roundIndex + 1 >= game.rounds
    if (!isLastRound) {
      setRoundIndex((index) => index + 1)
      setCurrentResult(null)
      return
    }

    setAdvancing(true)
    const collected = rounds.length > roundIndex ? rounds : [...rounds, currentResult]
    const aggregated = aggregateRounds(collected)
    const durationMs = startedAt === null ? 0 : nowMs() - startedAt
    const result: GameResult = {
      gameId: game.id,
      gameName: game.name,
      category: game.category,
      accuracy: aggregated.accuracy,
      grade: gradeFor(aggregated.accuracy),
      answerLabel: aggregated.answerLabel,
      correctLabel: aggregated.correctLabel,
      errorLabel: aggregated.errorLabel,
      rounds: collected,
      durationMs,
    }

    const completedId = recordGameResult(result)
    if (completedId) {
      navigate(`/results/${completedId}`)
    }
  }

  const isLastRound = roundIndex + 1 >= game.rounds
  const isLastGame = session.currentIndex + 1 >= session.gameIds.length
  const continueLabel = !isLastRound
    ? `Next round (${roundIndex + 2}/${game.rounds})`
    : isLastGame
      ? 'See final results'
      : 'Continue to next game'

  const GameIcon = game.icon

  return (
    <div className="container-wide py-5 lg:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-accent">
            <GameIcon size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-accent">
              {modeLabel(session.mode)}
            </p>
            <h1 className="truncate text-lg font-bold tracking-tight text-fg sm:text-xl">
              {stage === 'intro' ? 'Prepare for the next test' : game.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ProgressIndicator
            current={progress}
            total={session.gameIds.length}
            className="w-32 sm:w-48"
          />
          <Button variant="ghost" size="sm" onClick={() => setConfirmExit(true)}>
            <X size={15} />
            Exit
          </Button>
        </div>
      </div>

      <div className="mt-4 grid items-start gap-4 lg:mt-5 lg:grid-cols-[minmax(0,1fr)_21rem] xl:grid-cols-[minmax(0,1fr)_23rem]">
        <section className="flex min-h-[31rem] flex-col rounded-2xl border border-border bg-card p-4 sm:p-5">
          {stage === 'intro' ? (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {game.category}
                </span>
                <span className="font-mono text-xs text-muted">
                  Game {session.currentIndex + 1} of {session.gameIds.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-center py-8">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <GameIcon size={28} />
                </span>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
                  {game.name}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  {game.description}
                </p>

                <ol className="mt-6 space-y-3">
                  {game.instructions.map((instruction, index) => (
                    <li key={instruction} className="flex gap-3 text-sm text-muted">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-elevated font-mono text-[0.65rem] font-semibold text-accent">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{instruction}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} />
                    {formatShortDuration(game.estimatedSeconds * game.rounds)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Target size={13} />
                    {game.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Flag size={13} />
                    {game.rounds} {game.rounds === 1 ? 'round' : 'rounds'}
                  </span>
                </div>

                <div className="mt-8">
                  <Button size="lg" onClick={beginGame}>
                    <Play size={16} />
                    Start {game.name}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    {game.category}
                  </span>
                  {game.rounds > 1 ? (
                    <span className="rounded-lg bg-accent-soft px-2.5 py-1 font-mono text-[0.65rem] font-semibold text-accent">
                      Round {roundIndex + 1}/{game.rounds}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-muted">{game.name}</span>
              </div>

              <div className="flex-1">
                <game.component
                  key={`${game.id}:${roundIndex}`}
                  seed={`${session.seed}:${game.id}:${roundIndex}:${session.currentIndex}`}
                  difficulty={game.difficulty}
                  locked={currentResult !== null}
                  onComplete={handleRoundComplete}
                />
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-3">
          {stage === 'play' && currentResult ? (
            <ResultPanel
              game={game}
              result={currentResult}
              round={roundIndex + 1}
              onContinue={handleContinue}
              continueLabel={continueLabel}
            />
          ) : stage === 'play' ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
                <Target size={13} />
                Live challenge
              </div>
              <h2 className="mt-3 text-lg font-bold text-fg">{game.name}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{game.description}</p>
              <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted">
                <div className="flex items-center justify-between gap-3">
                  <span>Category</span>
                  <span className="font-medium text-fg">{game.category}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Round</span>
                  <span className="font-mono text-fg">
                    {roundIndex + 1}/{game.rounds}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Difficulty</span>
                  <span className="font-medium text-fg">{game.difficulty}</span>
                </div>
              </div>
              <p className="mt-4 rounded-xl bg-elevated px-3 py-2.5 text-xs leading-relaxed text-muted">
                Submit your answer to freeze it and reveal the result. The correct answer stays
                hidden until then.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
                <Layers size={13} />
                Session plan
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-b border-border pb-3">
                <span className="text-sm font-semibold text-fg">
                  {modeLabel(session.mode)}
                </span>
                <span className="font-mono text-xs text-muted">
                  {progress}/{session.gameIds.length}
                </span>
              </div>
              <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
                {session.gameIds.map((id, index) => {
                  const definition = getGame(id)
                  const result = session.results[index]
                  const isCurrent = index === session.currentIndex
                  return (
                    <div
                      key={`${id}-${index}`}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs',
                        isCurrent && 'bg-accent-soft text-fg',
                        !isCurrent && index < session.currentIndex && 'text-muted',
                        !isCurrent && index > session.currentIndex && 'text-muted/60',
                      )}
                    >
                      <span
                        className={cn(
                          'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-[0.6rem]',
                          result
                            ? 'bg-success-soft text-success'
                            : isCurrent
                              ? 'bg-accent text-white'
                              : 'bg-elevated text-muted',
                        )}
                      >
                        {result ? '✓' : index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {definition?.name ?? id}
                      </span>
                      {result ? (
                        <span className="font-mono text-[0.65rem] text-muted">
                          {result.accuracy.toFixed(0)}%
                        </span>
                      ) : null}
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 border-t border-border pt-3 text-xs text-muted">
                Estimated session time:{' '}
                <span className="font-medium text-fg">{formatShortDuration(totalSeconds)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-xs text-muted">
            <span>Need a break?</span>
            <button
              type="button"
              onClick={() => setConfirmExit(true)}
              className="font-medium text-accent hover:underline"
            >
              Save & exit
            </button>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmExit}
        title="Exit this session?"
        description="The session is saved locally, so you can continue from the home page. Your current unfinished game will restart from the beginning."
        confirmLabel="Exit session"
        cancelLabel="Keep playing"
        danger
        onCancel={() => setConfirmExit(false)}
        onConfirm={() => {
          setConfirmExit(false)
          navigate('/')
        }}
      />
    </div>
  )
}

export function SessionPage() {
  const activeSession = useSessionStore((state) => state.activeSession)

  if (!activeSession) {
    return (
      <div className="container-wide py-16">
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-bold text-fg">No active session</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Start a daily challenge, marathon, or choose a single game from the library.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link to="/" className={buttonClasses('primary')}>
              Back home
            </Link>
            <Link to="/games" className={buttonClasses('secondary')}>
              Browse games
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <SessionRunner key={`${activeSession.id}:${activeSession.currentIndex}`} session={activeSession} />
}
