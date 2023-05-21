import { Doc } from '../convex/_generated/dataModel'
export interface GameInfo {
  game: Doc<'Game'> & {
    id: string
    currentPlayer: Doc<'Player'> & { id: string; prosets: any }
    allPlayers: (Doc<'Player'> & { id: string; prosets: any })[]
  }
}
