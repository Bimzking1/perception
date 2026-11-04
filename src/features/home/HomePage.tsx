import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Gauge,
  Layers,
  MousePointerClick,
  Play,
  Target,
  Trophy,
} from 'lucide-react'
import { GAME_REGISTRY } from '../games/registry'
import { useSessionStore } from '../sessions/sessionStore'
import { dailySeed, getDailyGameIds, getMarathonGameIds, DAILY_GAME_COUNT } from '../sessions/daily'
import { buttonClasses, Button } from '../../components/common/Button'
import { GradeBadge } from '../../components/common/GradeBadge'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import {
  average,
  cn,
  formatAccuracy,
  formatShortDuration,
  modeLabel,
  todayKey,
} from '../../lib/utils'

interface PendingConfirm {
  title: string
  description: string
  confirmLabel: string
  run: () => void
}

export function HomePage() {
  const navigate = useNavigate()
  const activeSession = useSessionStore((state) => state.activeSession)
  const sessions = useSessionStore((state) => state.sessions)
  const startSession = useSessionStore((state) => state.startSession)
  const abandonSession = useSessionStore((state) => state.abandonSession)
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const today = todayKey()
  const dailyGameIds = useMemo(() => getDailyGameIds(today), [today])
  const dailyRecord = sessions.find(
    (session) => session.mode === 'daily' && session.dailyDate === today,
  )
  const activeDaily =
    activeSession?.mode === 'daily' && activeSession.dailyDate === today ? activeSession : null

  const marathonSeconds = GAME_REGISTRY.reduce(
    (sum, game) => sum + game.estimatedSeconds * game.rounds,
    0,
  )
  const dailySeconds = dailyGameIds.reduce((sum, id) => {
    const game = GAME_REGISTRY.find((item) => item.id === id)
    return sum + (game ? game.estimatedSeconds * game.rounds : 0)
  }, 0)
  const recentAccuracy = average(
    sessions.slice(0, 5).flatMap((session) => session.results.map((result) => result.accuracy)),
  )

  const goToSession = () => navigate('/session')

  const startWithGuard = (run: () => void, label: string) => {
    if (!activeSession) {
      run()
      return
    }
    setPending({
      title: 'Abandon current session?',
      description: `Your ${modeLabel(activeSession.mode).toLowerCase()} session is ${Math.min(
        activeSession.results.length,
        activeSession.gameIds.length,
      )}/${activeSession.gameIds.length} complete. Starting ${label} will discard its progress.`,
      confirmLabel: 'Discard and start',
      run: () => {
        abandonSession()
        run()
      },
    })
  }

  const beginDaily = () => {
    if (dailyRecord) return
    startWithGuard(() => {
      const created = startSession({
        mode: 'daily',
        gameIds: dailyGameIds,
        dailyDate: today,
        seed: dailySeed(today),
      })
      if (created) goToSession()
    }, 'the Daily Challenge')
  }

  const beginMarathon = () => {
    startWithGuard(() => {
      const created = startSession({
        mode: 'marathon',
        gameIds: getMarathonGameIds(),
      })
      if (created) goToSession()
    }, 'a Marathon')
  }

  const confirmAbandon = () => {
    if (!activeSession) return
    setPending({
      title: 'Abandon this session?',
      description:
        'Games you already completed will be discarded and the session will not appear in your statistics.',
      confirmLabel: 'Abandon session',
      run: () => abandonSession(),
    })
  }

  const dailyStatus = dailyRecord
    ? 'Completed'
    : activeDaily
      ? 'In progress'
      : 'Available'

  return (
    <div className="container-wide py-7 sm:py-9 lg:py-10">
      <section className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:gap-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <Target size={13} className="text-accent" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
              Human measurement lab
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-extrabold leading-[1.06] tracking-[-0.03em] text-fg sm:text-5xl xl:text-6xl">
            How accurately does your brain measure the world?
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Challenge your perception through a collection of visual, spatial, and time-based
            mini-games. No rulers, no clocks, no second chances on the daily run.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {dailyRecord ? (
              <Link
                to={`/results/${dailyRecord.id}`}
                className={buttonClasses('primary', 'lg')}
              >
                <CalendarCheck size={16} />
                View today’s result
              </Link>
            ) : activeDaily ? (
              <Button size="lg" onClick={goToSession}>
                <Play size={16} />
                Continue daily challenge
              </Button>
            ) : (
              <Button size="lg" onClick={beginDaily}>
                <CalendarCheck size={16} />
                Start daily challenge
              </Button>
            )}
            <Link to="/games" className={buttonClasses('secondary', 'lg')}>
              Browse all games
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-accent/15" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-accent/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">
                Calibration snapshot
              </p>
              <p className="mt-1.5 text-lg font-bold text-fg">Perception profile</p>
            </div>
            <Gauge size={22} className="text-accent" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="font-mono text-2xl font-semibold text-fg">{GAME_REGISTRY.length}</p>
              <p className="mt-1 text-[0.6rem] uppercase tracking-[0.12em] text-muted">Games</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="font-mono text-2xl font-semibold text-fg">{sessions.length}</p>
              <p className="mt-1 text-[0.6rem] uppercase tracking-[0.12em] text-muted">Sessions</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-3">
              <p className="font-mono text-2xl font-semibold text-fg">
                {recentAccuracy > 0 ? formatAccuracy(recentAccuracy) : '—'}
              </p>
              <p className="mt-1 text-[0.6rem] uppercase tracking-[0.12em] text-muted">Recent</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Trophy size={14} className="text-warning" />
              Best overall
            </div>
            <span className="font-mono text-sm font-semibold text-fg">
              {sessions.length > 0
                ? formatAccuracy(Math.max(...sessions.map((session) => session.overallAccuracy)))
                : 'Not set'}
            </span>
          </div>
        </div>
      </section>

      {activeSession && !activeDaily ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-card text-accent">
              <Play size={15} />
            </span>
            <div>
              <p className="text-sm font-semibold text-fg">
                Unfinished {modeLabel(activeSession.mode).toLowerCase()}
              </p>
              <p className="text-xs text-muted">
                {Math.min(activeSession.results.length, activeSession.gameIds.length)}/
                {activeSession.gameIds.length} games complete
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={goToSession}>
              Continue
            </Button>
            <Button size="sm" variant="ghost" onClick={confirmAbandon}>
              Abandon
            </Button>
          </div>
        </div>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article
          className={cn(
            'relative flex flex-col overflow-hidden rounded-2xl border bg-card p-5',
            dailyRecord ? 'border-border' : 'border-accent/35',
          )}
        >
          {!dailyRecord ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/80 to-transparent" />
          ) : null}
          <div className="flex items-start justify-between">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <CalendarCheck size={20} />
            </span>
            <span
              className={cn(
                'rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em]',
                dailyRecord
                  ? 'border-success/35 bg-success-soft text-success'
                  : activeDaily
                    ? 'border-warning/35 bg-warning-soft text-warning'
                    : 'border-accent/30 bg-accent-soft text-accent',
              )}
            >
              {dailyStatus}
            </span>
          </div>
          <h2 className="mt-4 text-lg font-bold text-fg">Daily Challenge</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Five random challenges. One attempt to prove your perception.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-md bg-elevated px-2 py-1">{DAILY_GAME_COUNT} games</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-elevated px-2 py-1">
              <Clock size={11} /> {formatShortDuration(dailySeconds)}
            </span>
            <span className="rounded-md bg-elevated px-2 py-1">Locks after completion</span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <div>
              <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-muted">
                Today
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {dailyRecord ? 'Result saved' : 'Same games for everyone'}
              </p>
            </div>
            {dailyRecord ? (
              <div className="flex items-center gap-2">
                <GradeBadge grade={dailyRecord.overallGrade} size="sm" />
                <Link to={`/results/${dailyRecord.id}`} className={buttonClasses('secondary', 'sm')}>
                  View
                </Link>
              </div>
            ) : activeDaily ? (
              <Button size="sm" onClick={goToSession}>
                Continue
              </Button>
            ) : (
              <Button size="sm" onClick={beginDaily}>
                Start
              </Button>
            )}
          </div>
        </article>

        <article className="flex flex-col rounded-2xl border border-border bg-card p-5">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-fg">
            <Layers size={20} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-fg">Marathon</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Play every available game in one complete perception test.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-md bg-elevated px-2 py-1">{GAME_REGISTRY.length} games</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-elevated px-2 py-1">
              <Clock size={11} /> {formatShortDuration(marathonSeconds)}
            </span>
            <span className="rounded-md bg-elevated px-2 py-1">Random order</span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted">Full-spectrum test</p>
            <Button size="sm" variant="secondary" onClick={beginMarathon}>
              Play marathon
            </Button>
          </div>
        </article>

        <article className="flex flex-col rounded-2xl border border-border bg-card p-5">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-elevated text-fg">
            <MousePointerClick size={20} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-fg">Manual Play</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Choose exactly what you want to test, then replay it as often as you like.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-md bg-elevated px-2 py-1">{GAME_REGISTRY.length} games</span>
            <span className="rounded-md bg-elevated px-2 py-1">Pick one</span>
            <span className="rounded-md bg-elevated px-2 py-1">Replayable</span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted">Build your own test</p>
            <Link to="/games" className={buttonClasses('secondary', 'sm')}>
              Choose game
            </Link>
          </div>
        </article>
      </section>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.title ?? ''}
        description={pending?.description ?? ''}
        confirmLabel={pending?.confirmLabel ?? 'Confirm'}
        danger
        onCancel={() => setPending(null)}
        onConfirm={() => {
          const action = pending
          setPending(null)
          action?.run()
        }}
      />
    </div>
  )
}
