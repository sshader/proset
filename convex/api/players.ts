import { v } from 'convex/values'
import * as Players from '../players'
import { mutation } from '../_generated/server'

export const joinGame = mutation({
  args: { gameId: v.id('Game') },
  handler: async (ctx, { gameId }) => Players.joinGame(ctx, { gameId }),
})
