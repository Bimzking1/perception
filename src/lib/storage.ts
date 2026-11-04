export const STORAGE_KEYS = {
  theme: 'perception.theme',
  store: 'perception.store.v1',
  splash: 'perception.splash.seen',
} as const

export function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function safeWriteJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be unavailable in private browsing or when the quota is full.
  }
}

export function safeSessionGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function safeSessionSet(key: string, value: string): void {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // Ignore unavailable session storage.
  }
}
