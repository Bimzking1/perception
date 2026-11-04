import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SearchX, SlidersHorizontal, Play } from 'lucide-react'
import { CATEGORIES } from '../../types'
import type { Category, GameDefinition } from '../../types'
import { GAME_REGISTRY } from './registry'
import { useSessionStore } from '../sessions/sessionStore'
import { GameCard } from '../../components/common/GameCard'
import { Button } from '../../components/common/Button'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { EmptyState } from '../../components/common/EmptyState'
import { cn, modeLabel } from '../../lib/utils'

type Filter = 'All' | Category

interface PendingConfirm {
  title: string
  description: string
  confirmLabel: string
  run: () => void
}

export function GamesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const activeSession = useSessionStore((state) => state.activeSession)
  const bestScores = useSessionStore((state) => state.bestScores)
  const startSession = useSessionStore((state) => state.startSession)
  const abandonSession = useSessionStore((state) => state.abandonSession)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return GAME_REGISTRY.filter((game) => {
      const matchesCategory = filter === 'All' || game.category === filter
      const matchesSearch =
        query.length === 0 ||
        game.name.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query) ||
        game.category.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [filter, search])

  const startManual = (game: GameDefinition) => {
    const run = () => {
      const created = startSession({
        mode: 'manual',
        gameIds: [game.id],
        seed: `manual:${game.id}`,
      })
      if (created) navigate('/session')
    }

    if (!activeSession) {
      run()
      return
    }

    setPending({
      title: 'Abandon current session?',
      description: `Your ${modeLabel(activeSession.mode).toLowerCase()} session is ${Math.min(
        activeSession.results.length,
        activeSession.gameIds.length,
      )}/${activeSession.gameIds.length} complete. Starting ${game.name} will discard its progress.`,
      confirmLabel: 'Discard and play',
      run: () => {
        abandonSession()
        run()
      },
    })
  }

  const confirmAbandon = () => {
    setPending({
      title: 'Abandon this session?',
      description:
        'Games you already completed will be discarded and this session will not appear in your statistics.',
      confirmLabel: 'Abandon session',
      run: () => abandonSession(),
    })
  }

  return (
    <div className="container-wide py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
            Game library
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
            Choose your test
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {GAME_REGISTRY.length} perception challenges across time, geometry, quantity, proportion,
            spatial reasoning, and memory.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search games"
            aria-label="Search games"
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {activeSession ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-card text-accent">
              <Play size={15} />
            </span>
            <div>
              <p className="text-sm font-semibold text-fg">
                {modeLabel(activeSession.mode)} in progress
              </p>
              <p className="text-xs text-muted">
                {Math.min(activeSession.results.length, activeSession.gameIds.length)}/
                {activeSession.gameIds.length} games complete
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate('/session')}>
              Continue
            </Button>
            <Button size="sm" variant="ghost" onClick={confirmAbandon}>
              Abandon
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-1">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted">
          <SlidersHorizontal size={13} />
          Filter
        </span>
        <div className="flex gap-1.5">
          {(['All', ...CATEGORIES] as Filter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={cn(
                'shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                filter === item
                  ? 'border-accent/45 bg-accent-soft text-accent'
                  : 'border-border bg-card text-muted hover:border-accent/30 hover:text-fg',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Showing <span className="font-mono text-fg">{filtered.length}</span> of{' '}
          <span className="font-mono text-fg">{GAME_REGISTRY.length}</span> games
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={SearchX}
          title="No games match that search"
          description="Try a different keyword or clear the category filter to see the full library."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('')
                setFilter('All')
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              bestScore={bestScores[game.id]}
              onPlay={startManual}
            />
          ))}
        </div>
      )}

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
