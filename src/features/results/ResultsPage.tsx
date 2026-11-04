import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarClock,
  Home,
  Layers,
  RefreshCw,
  Share2,
  TrendingDown,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { useSessionStore } from '../sessions/sessionStore'
import { getMarathonGameIds } from '../sessions/daily'
import { GradeBadge } from '../../components/common/GradeBadge'
import { StatCard } from '../../components/common/StatCard'
import { Button, buttonClasses } from '../../components/common/Button'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import {
  cn,
  formatAccuracy,
  formatDateTime,
  formatDuration,
  modeLabel,
} from '../../lib/utils'

export function ResultsPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const sessions = useSessionStore((state) => state.sessions)
  const activeSession = useSessionStore((state) => state.activeSession)
  const startSession = useSessionStore((state) => state.startSession)
  const abandonSession = useSessionStore((state) => state.abandonSession)

  const [shareStatus, setShareStatus] = useState('')
  const [confirmReplay, setConfirmReplay] = useState(false)

  const record = sessions.find((session) => session.id === sessionId)

  const previousBest = useMemo(() => {
    if (!record) return null
    const earlier = sessions.filter(
      (session) => session.id !== record.id && session.completedAt < record.completedAt,
    )
    if (earlier.length === 0) return null
    return Math.max(...earlier.map((session) => session.overallAccuracy))
  }, [record, sessions])

  const history = useMemo(() => {
    if (!record) return []
    return sessions
      .filter((session) => session.id !== record.id)
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 5)
  }, [record, sessions])

  if (!record) {
    return (
      <div className="container-wide py-16">
        <div className="mx-auto max-w-xl">
          <EmptyState
            icon={Award}
            title="Result not found"
            description="This result may have been cleared from local storage, or the link is incomplete."
            action={
              <Link to="/" className={buttonClasses('primary')}>
                <Home size={15} />
                Back home
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const ordered = [...record.results].sort((a, b) => b.accuracy - a.accuracy)
  const best = ordered[0]
  const worst = ordered[ordered.length - 1]
  const recordedBest = Math.max(...record.results.map((result) => result.accuracy))
  const recordedWorst = Math.min(...record.results.map((result) => result.accuracy))
  const difference = previousBest === null ? null : record.overallAccuracy - previousBest

  const replay = () => {
    const gameIds =
      record.mode === 'daily'
        ? record.gameIds
        : record.mode === 'manual'
          ? record.gameIds
          : getMarathonGameIds()
    const created = startSession({
      mode: 'manual',
      gameIds,
      seed: `replay:${record.id}:${Date.now()}`,
    })
    if (created) navigate('/session')
  }

  const runReplay = () => {
    if (activeSession) {
      setConfirmReplay(true)
      return
    }
    replay()
  }

  const share = async () => {
    const text = `PERCEPTION — ${modeLabel(record.mode)}: ${formatAccuracy(
      record.overallAccuracy,
    )} (Grade ${record.overallGrade}) across ${record.results.length} games.`
    const url = window.location.href

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'PERCEPTION result', text, url })
        setShareStatus('Shared')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`)
      setShareStatus('Copied to clipboard')
    } catch {
      setShareStatus('Sharing is unavailable')
    }
    window.setTimeout(() => setShareStatus(''), 2600)
  }

  return (
    <div className="container-wide py-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
            Session complete
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            {modeLabel(record.mode)} results
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>{formatDateTime(record.completedAt)}</span>
            <span>·</span>
            <span>{record.results.length} games</span>
            <span>·</span>
            <span>{formatDuration(record.durationMs)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={share}>
            <Share2 size={15} />
            Share results
          </Button>
          <Link to="/" className={buttonClasses('ghost')}>
            <Home size={15} />
            Home
          </Link>
        </div>
      </div>

      {shareStatus ? (
        <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-xs font-medium text-accent">
          {shareStatus}
        </p>
      ) : null}

      <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-6 p-6 lg:grid-cols-[auto_1fr_18rem] lg:items-center lg:p-7">
          <div className="flex items-center gap-5">
            <GradeBadge grade={record.overallGrade} size="lg" className="h-24 min-w-24 text-5xl" />
            <div>
              <p className="font-mono text-4xl font-semibold tracking-tight text-fg">
                {formatAccuracy(record.overallAccuracy)}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                Overall accuracy
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:border-l lg:border-border lg:pl-6">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted">Games</p>
              <p className="mt-1 font-mono text-lg font-semibold text-fg">{record.results.length}</p>
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted">Time</p>
              <p className="mt-1 font-mono text-lg font-semibold text-fg">
                {formatDuration(record.durationMs)}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted">Best game</p>
              <p className="mt-1 truncate text-sm font-semibold text-fg">{best?.gameName ?? '—'}</p>
              <p className="font-mono text-xs text-success">
                {best ? formatAccuracy(best.accuracy) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted">Weakest game</p>
              <p className="mt-1 truncate text-sm font-semibold text-fg">{worst?.gameName ?? '—'}</p>
              <p className="font-mono text-xs text-muted">
                {worst ? formatAccuracy(worst.accuracy) : '—'}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'rounded-xl border p-4',
              difference === null
                ? 'border-border bg-surface'
                : difference >= 0
                  ? 'border-success/30 bg-success-soft'
                  : 'border-warning/30 bg-warning-soft',
            )}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {difference === null ? (
                <Trophy size={13} />
              ) : difference >= 0 ? (
                <TrendingUp size={13} className="text-success" />
              ) : (
                <TrendingDown size={13} className="text-warning" />
              )}
              vs previous best
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold text-fg">
              {difference === null
                ? 'First result'
                : `${difference >= 0 ? '+' : ''}${difference.toFixed(1)} pts`}
            </p>
            <p className="mt-1 text-xs text-muted">
              {previousBest === null
                ? 'No earlier sessions to compare.'
                : `Previous best: ${formatAccuracy(previousBest)}`}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-fg">Individual results</h2>
            <span className="text-xs text-muted">{record.results.length} games scored</span>
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-surface text-[0.62rem] uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="w-[24%] px-4 py-3 font-medium">Game</th>
                  <th className="w-[21%] px-3 py-3 font-medium">Your answer</th>
                  <th className="w-[21%] px-3 py-3 font-medium">Correct</th>
                  <th className="w-[18%] px-3 py-3 font-medium">Error</th>
                  <th className="w-[10%] px-3 py-3 text-right font-medium">Accuracy</th>
                  <th className="w-[6%] px-3 py-3 text-right font-medium">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {record.results.map((result, index) => (
                  <tr key={`${result.gameId}-${index}`} className="align-top">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-fg">{result.gameName}</p>
                      <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.1em] text-muted">
                        {result.category}
                        {result.rounds.length > 1 ? ` · ${result.rounds.length} rounds` : ''}
                      </p>
                    </td>
                    <td className="break-words px-3 py-3.5 font-mono text-xs text-fg">
                      {result.answerLabel}
                    </td>
                    <td className="break-words px-3 py-3.5 font-mono text-xs text-success">
                      {result.correctLabel}
                    </td>
                    <td className="break-words px-3 py-3.5 font-mono text-xs text-muted">
                      {result.errorLabel}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-xs font-semibold text-fg">
                      {formatAccuracy(result.accuracy)}
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <GradeBadge grade={result.grade} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {record.results.map((result, index) => (
              <article
                key={`${result.gameId}-${index}`}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-fg">{result.gameName}</p>
                    <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.1em] text-muted">
                      {result.category}
                      {result.rounds.length > 1 ? ` · ${result.rounds.length} rounds` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-fg">
                      {formatAccuracy(result.accuracy)}
                    </span>
                    <GradeBadge grade={result.grade} size="sm" />
                  </div>
                </div>
                <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Your answer</dt>
                    <dd className="text-right font-mono text-fg">{result.answerLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Correct</dt>
                    <dd className="text-right font-mono text-success">{result.correctLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Error</dt>
                    <dd className="text-right font-mono text-muted">{result.errorLabel}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Highest" value={formatAccuracy(recordedBest)} detail="Single game" />
            <StatCard label="Lowest" value={formatAccuracy(recordedWorst)} detail="Single game" />
          </div>
          <StatCard
            label="Average"
            value={formatAccuracy(
              record.results.reduce((sum, result) => sum + result.accuracy, 0) /
                Math.max(record.results.length, 1),
            )}
            detail="Arithmetic mean"
            icon={TrendingUp}
          />

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
              <CalendarClock size={13} />
              Recent history
            </div>
            {history.length === 0 ? (
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Your next completed session will appear here for comparison.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {history.map((session) => (
                  <Link
                    key={session.id}
                    to={`/results/${session.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 transition-colors hover:border-accent/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-fg">
                        {modeLabel(session.mode)}
                      </p>
                      <p className="text-[0.65rem] text-muted">
                        {formatDateTime(session.completedAt)}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-fg">
                      {formatAccuracy(session.overallAccuracy)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={runReplay}>
              <RefreshCw size={15} />
              Play again
            </Button>
            {record.mode === 'daily' ? (
              <p className="text-center text-[0.65rem] leading-relaxed text-muted">
                Daily results are locked. Replay starts a practice session with the same five
                games.
              </p>
            ) : null}
            <Link to="/" className={buttonClasses('secondary', 'md', 'w-full')}>
              <ArrowLeft size={15} />
              Back to home
            </Link>
            <Link to="/games" className={buttonClasses('ghost', 'md', 'w-full')}>
              <Layers size={15} />
              All games
              <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmReplay}
        title="Abandon current session?"
        description={`You have an unfinished ${modeLabel(
          activeSession?.mode ?? 'manual',
        ).toLowerCase()} session. Starting a replay will discard its progress.`}
        confirmLabel="Discard and replay"
        danger
        onCancel={() => setConfirmReplay(false)}
        onConfirm={() => {
          setConfirmReplay(false)
          abandonSession()
          replay()
        }}
      />
    </div>
  )
}
