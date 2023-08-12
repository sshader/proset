import { Doc } from '../_generated/dataModel'
export interface GameInfo {
  game: Doc<'Game'>
  currentPlayer: Doc<'Player'> & { showOnboarding: boolean }
  otherPlayers: Doc<'Player'>[]
  playerToProsets: Record<string, Doc<'PlayingCard'>[][]>
}
