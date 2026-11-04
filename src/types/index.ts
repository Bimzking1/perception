import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

export const CATEGORIES = [
  'Time',
  'Geometry',
  'Quantity',
  'Proportion',
  'Spatial',
  'Memory',
  'Physics',
] as const

export type Category = (typeof CATEGORIES)[number]
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
export type SessionMode = 'daily' | 'marathon' | 'manual'

export interface RoundResult {
  accuracy: number
  answerLabel: string
  correctLabel: string
  errorLabel: string
  note?: string
  rawAnswer: string | number
  rawCorrect: string | number
}

export interface GameComponentProps {
  seed: string
  difficulty: Difficulty
  locked: boolean
  onComplete: (result: RoundResult) => void
}

export interface GameDefinition {
  id: string
  name: string
  description: string
  instructions: string[]
  category: Category
  difficulty: Difficulty
  estimatedSeconds: number
  rounds: number
  icon: LucideIcon
  component: ComponentType<GameComponentProps>
}

export interface GameResult {
  gameId: string
  gameName: string
  category: Category
  accuracy: number
  grade: Grade
  answerLabel: string
  correctLabel: string
  errorLabel: string
  rounds: RoundResult[]
  durationMs: number
}

export interface ActiveSession {
  id: string
  mode: SessionMode
  gameIds: string[]
  currentIndex: number
  results: GameResult[]
  startedAt: number
  updatedAt: number
  seed: string
  dailyDate?: string
}

export interface SessionRecord extends ActiveSession {
  completedAt: number
  overallAccuracy: number
  overallGrade: Grade
  durationMs: number
}

export interface CompletedRound {
  accuracy: number
  answerLabel: string
  correctLabel: string
  errorLabel: string
  note?: string
  rawAnswer: string | number
  rawCorrect: string | number
  durationMs: number
}
