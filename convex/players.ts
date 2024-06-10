import { v } from 'convex/values'
import { mutationWithEnt } from './lib/functions'
import * as Players from './model/player'
import * as User from './model/user'

export const joinGame = mutationWithEnt({
  args: { gameId: v.id('Games'), sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, { gameId, sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    await Players.joinGame(ctx, { gameId, user })
  },
})
