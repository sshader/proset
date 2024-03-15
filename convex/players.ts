import { v } from 'convex/values'
import * as Players from './model/player'
import * as User from './model/user'
import { mutationWithEnt } from './lib/functions'

export const joinGame = mutationWithEnt({
  args: { gameId: v.id('Games'), sessionId: v.string() },
  handler: async (ctx, { gameId, sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    await Players.joinGame(ctx, { gameId, user })
  },
})
