import { Doc } from '../_generated/dataModel'
export interface GameInfo {
  game: Doc<'Games'>
  currentPlayer: Doc<'Players'> & { showOnboarding: boolean; isGuest: boolean }
  otherPlayers: Doc<'Players'>[]
  playerToProsets: Record<string, Doc<'PlayingCards'>[][]>
}
