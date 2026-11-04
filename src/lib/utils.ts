import type { Grade } from '../types'

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function gradeFor(accuracy: number): Grade {
  if (accuracy >= 98) return 'S'
  if (accuracy >= 90) return 'A'
  if (accuracy >= 80) return 'B'
  if (accuracy >= 65) return 'C'
  if (accuracy >= 40) return 'D'
  return 'F'
}

export function angularDifference(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360
  return raw > 180 ? 360 - raw : raw
}

export function accuracyFromError(error: number, zeroAt: number): number {
  if (!Number.isFinite(error)) return 0
  if (!Number.isFinite(zeroAt) || zeroAt <= 0) return error === 0 ? 100 : 0
  return clamp(100 * (1 - Math.abs(error) / zeroAt), 0, 100)
}

export function accuracyFromRelativeError(relativeError: number, zeroAt: number): number {
  if (!Number.isFinite(relativeError)) return 0
  return accuracyFromError(relativeError, zeroAt)
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`
}

export function formatAccuracy(value: number): string {
  return `${value.toFixed(value >= 99.95 ? 0 : 1)}%`
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function formatShortDuration(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s`
  return `~${Math.max(1, Math.round(seconds / 60))} min`
}

export function todayKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateLabel(key: string): string {
  const [year, month, day] = key.split('-').map(Number)
  if (!year || !month || !day) return key
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function nowMs(): number {
  return Date.now()
}

export function makeId(prefix: string): string {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}-${randomPart}`
}

export function modeLabel(mode: 'daily' | 'marathon' | 'manual'): string {
  if (mode === 'daily') return 'Daily Challenge'
  if (mode === 'marathon') return 'Marathon'
  return 'Manual Play'
}
