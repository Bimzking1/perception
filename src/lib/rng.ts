export interface Rng {
  next: () => number
  between: (min: number, max: number) => number
  int: (min: number, max: number) => number
  bool: (probability?: number) => boolean
  pick: <T>(items: readonly T[]) => T
  shuffle: <T>(items: readonly T[]) => T[]
}

export function hashString(input: string): number {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function createRng(seed: string): Rng {
  let state = hashString(seed)

  const next = (): number => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const between = (min: number, max: number): number => min + next() * (max - min)

  const int = (min: number, max: number): number => Math.floor(between(min, max + 1))

  const bool = (probability = 0.5): boolean => next() < probability

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) throw new Error('Cannot pick from an empty array')
    return items[Math.floor(next() * items.length)] as T
  }

  const shuffle = <T>(items: readonly T[]): T[] => {
    const copy = [...items]
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(next() * (index + 1))
      const current = copy[index] as T
      copy[index] = copy[swapIndex] as T
      copy[swapIndex] = current
    }
    return copy
  }

  return { next, between, int, bool, pick, shuffle }
}
