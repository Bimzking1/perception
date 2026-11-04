import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { StateStorage } from 'zustand/middleware'
import type { ActiveSession, GameResult, SessionMode, SessionRecord } from '../../types'
import { average, gradeFor, makeId } from '../../lib/utils'
import { STORAGE_KEYS } from '../../lib/storage'

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      const raw = window.localStorage.getItem(name)
      if (!raw) return null
      JSON.parse(raw)
      return raw
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value)
    } catch {
      // Ignore storage failures.
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name)
    } catch {
      // Ignore storage failures.
    }
  },
}

interface StartSessionInput {
  mode: SessionMode
  gameIds: string[]
  seed?: string
  dailyDate?: string
}

interface SessionStore {
  activeSession: ActiveSession | null
  sessions: SessionRecord[]
  bestScores: Record<string, number>
  startSession: (input: StartSessionInput) => ActiveSession | null
  recordGameResult: (result: GameResult) => string | null
  abandonSession: () => void
}

const MAX_SESSIONS = 250

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      activeSession: null,
      sessions: [],
      bestScores: {},

      startSession: (input) => {
        if (input.gameIds.length === 0) return null
        const now = Date.now()
        const session: ActiveSession = {
          id: makeId(input.mode),
          mode: input.mode,
          gameIds: [...input.gameIds],
          currentIndex: 0,
          results: [],
          startedAt: now,
          updatedAt: now,
          seed: input.seed ?? `${input.mode}:${now}:${Math.random().toString(36).slice(2)}`,
          dailyDate: input.dailyDate,
        }
        set({ activeSession: session })
        return session
      },

      recordGameResult: (result) => {
        const session = get().activeSession
        if (!session) return null

        const results = [...session.results, result]
        const bestScores = { ...get().bestScores }
        const previousBest = bestScores[result.gameId] ?? -1
        if (result.accuracy > previousBest) {
          bestScores[result.gameId] = result.accuracy
        }

        const now = Date.now()

        if (results.length >= session.gameIds.length) {
          const overallAccuracy = average(results.map((item) => item.accuracy))
          const record: SessionRecord = {
            ...session,
            results,
            currentIndex: results.length,
            updatedAt: now,
            completedAt: now,
            overallAccuracy,
            overallGrade: gradeFor(overallAccuracy),
            durationMs: now - session.startedAt,
          }
          set({
            activeSession: null,
            sessions: [record, ...get().sessions].slice(0, MAX_SESSIONS),
            bestScores,
          })
          return record.id
        }

        set({
          activeSession: {
            ...session,
            results,
            currentIndex: results.length,
            updatedAt: now,
          },
          bestScores,
        })
        return null
      },

      abandonSession: () => {
        set({ activeSession: null })
      },
    }),
    {
      name: STORAGE_KEYS.store,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        activeSession: state.activeSession,
        sessions: state.sessions,
        bestScores: state.bestScores,
      }),
    },
  ),
)
