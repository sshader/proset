import { Document } from '../convex/_generated/dataModel'
export interface GameInfo {
  game: Document<'Game'>
  currentPlayer: Document<'Player'>
  otherPlayers: Array<Document<'Player'>>
  playerToProsets: Record<string, Array<Array<Document<'PlayingCard'>>>>
}
