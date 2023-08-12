import { v } from 'convex/values'
import { mutation } from './_generated/server'
import * as Players from './model/player'
import * as User from './model/user'

export const joinGame = mutation({
  args: { gameId: v.id('Game'), sessionId: v.union(v.null(), v.id('Session')) },
  handler: async (ctx, { gameId, sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    await Players.joinGame(ctx, { gameId, user })
  },
})
