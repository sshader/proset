import { Doc } from '../convex/_generated/dataModel'
export interface GameInfo {
  game: Doc<'Game'>
  currentPlayer: Doc<'Player'>
  otherPlayers: Doc<'Player'>[]
  playerToProsets: Map<string, Doc<'PlayingCard'>[][]>
}
