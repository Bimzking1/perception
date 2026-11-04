import type { GameDefinition } from '../../types'
import { countdownGame } from './implementations/countdown/CountdownGame'
import { angleGame } from './implementations/angle/AngleGame'
import { countGame } from './implementations/count/CountGame'
import { distanceGame } from './implementations/distance/DistanceGame'
import { measureGame } from './implementations/measure/MeasureGame'
import { dotRecallGame } from './implementations/dot-recall/DotRecallGame'
import { blackWhiteGame } from './implementations/black-white/BlackWhiteGame'
import { boxComparisonGame } from './implementations/box-comparison/BoxComparisonGame'
import { pickFractionGame } from './implementations/pick-fraction/PickFractionGame'
import { centerGravityGame } from './implementations/center-gravity/CenterGravityGame'
import { waterLevelGame } from './implementations/water-level/WaterLevelGame'
import { rotationGame } from './implementations/rotation/RotationGame'

export const GAME_REGISTRY: GameDefinition[] = [
  countdownGame,
  angleGame,
  countGame,
  distanceGame,
  measureGame,
  dotRecallGame,
  blackWhiteGame,
  boxComparisonGame,
  pickFractionGame,
  centerGravityGame,
  waterLevelGame,
  rotationGame,
]

export const GAME_MAP: Record<string, GameDefinition> = Object.fromEntries(
  GAME_REGISTRY.map((game) => [game.id, game]),
)

export function getGame(gameId: string): GameDefinition | undefined {
  return GAME_MAP[gameId]
}

export function getAllGameIds(): string[] {
  return GAME_REGISTRY.map((game) => game.id)
}
