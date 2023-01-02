import { Document } from '../convex/_generated/dataModel'
export interface GameInfo {
  game: Document<'Game'>
  currentPlayer: Document<'Player'>
  otherPlayers: Document<'Player'>[]
  playerToProsets: Map<string, Document<'PlayingCard'>[][]>
}
