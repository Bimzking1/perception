import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  CalendarCheck,
  Layers,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { CATEGORIES } from '../../types'
import type { Category } from '../../types'
import { useSessionStore } from '../sessions/sessionStore'
import { GAME_REGISTRY } from '../games/registry'
import { AccuracyChart } from '../../components/charts/AccuracyChart'
import { CategoryBars } from '../../components/charts/CategoryBars'
import { StatCard } from '../../components/common/StatCard'
import { GradeBadge } from '../../components/common/GradeBadge'
import { EmptyState } from '../../components/common/EmptyState'
import { buttonClasses } from '../../components/common/Button'
import {
  average,
  formatAccuracy,
  formatDateLabel,
  formatDateTime,
  modeLabel,
} from '../../lib/utils'

export function StatisticsPage() {
  const sessions = useSessionStore((state) => state.sessions)
  const bestScores = useSessionStore((state) => state.bestScores)

  const stats = useMemo(() => {
    const allResults = sessions.flatMap((session) => session.results)
    const totalGames = allResults.length
    const avgAccuracy = average(allResults.map((result) => result.accuracy))
    const bestOverall =
      sessions.length > 0
        ? Math.max(...sessions.map((session) => session.overallAccuracy))
        : 0

    const categoryMap = new Map<Category, { total: number; plays: number }>()
    for (const result of allResults) {
      const current = categoryMap.get(result.category) ?? { total: 0, plays: 0 }
      current.total += result.accuracy
      current.plays += 1
      categoryMap.set(result.category, current)
    }

    const categoryStats = CATEGORIES.filter((category) => categoryMap.has(category))
      .map((category) => {
        const entry = categoryMap.get(category)
        return {
          label: category,
          value: entry && entry.plays > 0 ? entry.total / entry.plays : 0,
          plays: entry?.plays ?? 0,
        }
      })
      .sort((a, b) => b.value - a.value)

    const bestCategory = categoryStats[0]
    const worstCategory = categoryStats[categoryStats.length - 1]

    const gameStats = GAME_REGISTRY.map((game) => {
      const results = allResults.filter((result) => result.gameId === game.id)
      return {
        game,
        plays: results.length,
        average: average(results.map((result) => result.accuracy)),
        best: bestScores[game.id],
      }
    })

    const trend = [...sessions]
      .sort((a, b) => a.completedAt - b.completedAt)
      .slice(-18)
      .map((session) => ({
        label: new Date(session.completedAt).toLocaleDateString(undefined, {
          month: 'numeric',
          day: 'numeric',
        }),
        value: session.overallAccuracy,
      }))

    const dailyHistory = sessions
      .filter((session) => session.mode === 'daily')
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 8)

    const recentSessions = [...sessions]
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 8)

    return {
      allResults,
      totalGames,
      avgAccuracy,
      bestOverall,
      categoryStats,
      bestCategory,
      worstCategory,
      gameStats,
      trend,
      dailyHistory,
      recentSessions,
    }
  }, [bestScores, sessions])

  if (sessions.length === 0) {
    return (
      <div className="container-wide py-16">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={BarChart3}
            title="No statistics yet"
            description="Complete a daily challenge, a marathon, or a single game to build your perception profile."
            action={
              <Link to="/games" className={buttonClasses('primary')}>
                <Layers size={15} />
                Choose a game
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container-wide py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
            Personal statistics
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            Your perception profile
          </h1>
          <p className="mt-2 text-sm text-muted">
            Every completed session is stored locally on this device.
          </p>
        </div>
        <Link to="/games" className={buttonClasses('secondary')}>
          <Target size={15} />
          Play another game
        </Link>
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sessions" value={`${sessions.length}`} detail="Completed" icon={Layers} />
        <StatCard label="Games played" value={`${stats.totalGames}`} detail="Across all sessions" icon={Activity} />
        <StatCard
          label="Average accuracy"
          value={formatAccuracy(stats.avgAccuracy)}
          detail="All game results"
          icon={TrendingUp}
        />
        <StatCard
          label="Best overall"
          value={formatAccuracy(stats.bestOverall)}
          detail="Single session"
          icon={Trophy}
        />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-fg">Accuracy over time</h2>
              <p className="mt-0.5 text-xs text-muted">Last {stats.trend.length} sessions</p>
            </div>
            <Activity size={17} className="text-accent" />
          </div>
          <div className="mt-4 h-60">
            <AccuracyChart data={stats.trend} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-fg">Performance by category</h2>
              <p className="mt-0.5 text-xs text-muted">Average accuracy</p>
            </div>
            <BarChart3 size={17} className="text-accent" />
          </div>
          <div className="mt-4">
            <CategoryBars data={stats.categoryStats} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs">
            <div>
              <p className="uppercase tracking-[0.12em] text-muted">Strongest</p>
              <p className="mt-1 font-semibold text-success">
                {stats.bestCategory?.label ?? '—'}
              </p>
            </div>
            <div>
              <p className="uppercase tracking-[0.12em] text-muted">Weakest</p>
              <p className="mt-1 font-semibold text-warning">
                {stats.worstCategory?.label ?? '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-fg">Individual game performance</h2>
              <p className="mt-0.5 text-xs text-muted">Personal bests and averages</p>
            </div>
            <Trophy size={17} className="text-warning" />
          </div>
          <div className="mt-4 space-y-1">
            {stats.gameStats.map(({ game, plays, average: gameAverage, best }) => {
              const Icon = game.icon
              return (
                <div
                  key={game.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-elevated text-accent">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{game.name}</p>
                    <p className="text-[0.65rem] uppercase tracking-[0.1em] text-muted">
                      {game.category} · {plays} {plays === 1 ? 'play' : 'plays'}
                    </p>
                  </div>
                  <div className="w-24 shrink-0">
                    <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.max(2, gameAverage)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-right font-mono text-[0.65rem] text-muted">
                      avg {plays > 0 ? formatAccuracy(gameAverage) : '—'}
                    </p>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    {best === undefined ? (
                      <span className="text-xs text-muted">Not played</span>
                    ) : (
                      <div className="flex items-center justify-end gap-1.5">
                        <GradeBadge grade={best >= 98 ? 'S' : best >= 90 ? 'A' : best >= 80 ? 'B' : best >= 65 ? 'C' : best >= 40 ? 'D' : 'F'} size="sm" />
                        <span className="font-mono text-xs font-semibold text-fg">
                          {formatAccuracy(best)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
            <CalendarCheck size={13} />
            Daily challenge history
          </div>
          {stats.dailyHistory.length === 0 ? (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              No daily challenges completed yet. The daily result is locked after your first
              attempt.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {stats.dailyHistory.map((session) => (
                <Link
                  key={session.id}
                  to={`/results/${session.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 transition-colors hover:border-accent/40"
                >
                  <div>
                    <p className="text-xs font-medium text-fg">
                      {session.dailyDate ? formatDateLabel(session.dailyDate) : 'Daily'}
                    </p>
                    <p className="text-[0.65rem] text-muted">
                      {session.results.length} games
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-fg">
                      {formatAccuracy(session.overallAccuracy)}
                    </span>
                    <GradeBadge grade={session.overallGrade} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-fg">Session history</h2>
          <span className="text-xs text-muted">Latest {stats.recentSessions.length}</span>
        </div>
        <div className="divide-y divide-border">
          {stats.recentSessions.map((session) => (
            <Link
              key={session.id}
              to={`/results/${session.id}`}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-elevated text-accent">
                  {session.mode === 'daily' ? (
                    <CalendarCheck size={14} />
                  ) : session.mode === 'marathon' ? (
                    <Layers size={14} />
                  ) : (
                    <Target size={14} />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium text-fg">{modeLabel(session.mode)}</p>
                  <p className="text-[0.65rem] text-muted">
                    {formatDateTime(session.completedAt)} · {session.results.length} games
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm font-semibold text-fg">
                  {formatAccuracy(session.overallAccuracy)}
                </span>
                <GradeBadge grade={session.overallGrade} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
