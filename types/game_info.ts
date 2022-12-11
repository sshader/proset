import { Document } from '../convex/_generated/dataModel'
export type GameInfo = {
  game: Document<'Game'>
  currentPlayer: Document<'Player'>
  otherPlayers: Document<'Player'>[]
  playerToProsets: Record<string, Document<'PlayingCard'>[][]>
}
