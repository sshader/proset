import { v } from 'convex/values'
import * as Game from '../model/game'
import * as User from '../model/user'
import { BaseQueryCtx, Ent, queryWithEnt } from '../lib/functions'

export default queryWithEnt({
  args: {
    sessionId: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { sessionId }) => {
    if (sessionId === null) {
      return []
    }
    const user = await User.get(ctx, { sessionId })
    const games = await getGamesForUser(ctx, user)
    if (games.length === 0) {
      const publicGame = await Game.getPublicGame(ctx)
      return await getGamesInfo([publicGame])
    }
    return games
  },
})

const getGamesInfo = async (games: Array<Ent<'Games'>>) => {
  return await Promise.all(
    games.map(async (game) => {
      const players = await game.edge("Players");
      return {
        ...game,
        numPlayers: players.filter((p) => !p.isSystemPlayer).length,
      }
    })
  )
}

const getGamesForUser = async (ctx: BaseQueryCtx, user: Ent<'Users'>) => {
  const players = await user.edge("Players").take(10);
  const games = await Promise.all(
    players.map(async (player) => {
      return player.edgeX("Game")
    })
  )
  return await getGamesInfo(games.filter(game => game.deletionTime === undefined))
}
