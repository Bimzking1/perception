import type { RoundResult } from '../../types'
import { average, clamp } from '../../lib/utils'

export interface AggregatedRound {
  accuracy: number
  answerLabel: string
  correctLabel: string
  errorLabel: string
}

export function aggregateRounds(rounds: RoundResult[]): AggregatedRound {
  if (rounds.length === 0) {
    return {
      accuracy: 0,
      answerLabel: '—',
      correctLabel: '—',
      errorLabel: 'No answer',
    }
  }

  const first = rounds[0] as RoundResult
  if (rounds.length === 1) {
    return {
      accuracy: clamp(first.accuracy, 0, 100),
      answerLabel: first.answerLabel,
      correctLabel: first.correctLabel,
      errorLabel: first.errorLabel,
    }
  }

  const accuracy = average(rounds.map((round) => round.accuracy))
  const perfect = rounds.filter((round) => round.accuracy >= 99.5).length

  return {
    accuracy: clamp(accuracy, 0, 100),
    answerLabel: rounds.map((round) => round.answerLabel).join(' · '),
    correctLabel: rounds.map((round) => round.correctLabel).join(' · '),
    errorLabel: `${perfect} of ${rounds.length} perfect`,
  }
}
