import { v } from 'convex/values'
import { Doc } from '../_generated/dataModel'
import { DatabaseReader, query, QueryCtx } from '../_generated/server'
import * as Game from '../model/game'
import * as User from '../model/user'

export default query({
  args: {
    sessionId: v.union(v.id('Session'), v.null()),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    const games = await getGamesForUser(ctx, user)
    if (games.length === 0) {
      const publicGame = await Game.getPublicGame(ctx)
      return await getGamesInfo(ctx.db, [publicGame])
    }
    return games
  },
})

const getGamesInfo = async (db: DatabaseReader, games: Array<Doc<'Game'>>) => {
  return await Promise.all(
    games.map(async (game) => {
      const players = await db
        .query('Player')
        .withIndex('ByGame', (q) => q.eq('game', game._id))
        .collect()
      return {
        ...game,
        numPlayers: players.filter((p) => !p.isSystemPlayer).length,
      }
    })
  )
}

const getGamesForUser = async (ctx: QueryCtx, user: Doc<'User'>) => {
  const { db } = ctx
  const players = await db
    .query('Player')
    .withIndex('ByUser', (q) => q.eq('user', user._id))
    .order('desc')
    .take(10)
  const games = await Promise.all(
    players.map(async (player) => {
      return await db.get(player.game)
    })
  )
  return await getGamesInfo(
    db,
    games.filter<Doc<'Game'>>(
      (game): game is Doc<'Game'> => game !== null && game.inProgress
    )
  )
}
