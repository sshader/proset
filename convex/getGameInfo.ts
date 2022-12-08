import { query } from './_generated/server'
import { Document, Id } from './_generated/dataModel'
import { PaginationOptions, PaginationResult } from 'convex/server'

export default query(
  async ({ db }, gameId: Id<'Game'>, playerId: Id<'Player'>) => {
    const game = (await db.get(gameId))!
    const player = (await db.get(playerId))!
    return { game, player }
  }
)
