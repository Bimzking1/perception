import { createRng } from '../../lib/rng'
import { getAllGameIds } from '../games/registry'

export const DAILY_GAME_COUNT = 5

export function getDailyGameIds(dateKey: string): string[] {
  const ids = [...getAllGameIds()].sort()
  const rng = createRng(`perception-daily:${dateKey}`)
  return rng.shuffle(ids).slice(0, DAILY_GAME_COUNT)
}

export function getMarathonGameIds(): string[] {
  const ids = getAllGameIds()
  const rng = createRng(`perception-marathon:${Date.now()}:${Math.random()}`)
  return rng.shuffle(ids)
}

export function dailySeed(dateKey: string): string {
  return `daily:${dateKey}`
}
