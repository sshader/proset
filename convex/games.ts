import { v } from 'convex/values'
import { internalMutationWithEnt, mutationWithEnt, mutationWithGame, queryWithGame } from './lib/functions'
import * as Games from './model/game'
import * as Players from './model/player'
import * as User from './model/user'

export const start = mutationWithEnt({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    const gameId = await Games.createGame(ctx, { isPublic: false })
    await Players.joinGame(ctx, { gameId, user })
    return { gameId }
  },
})

export const getOrCreate = mutationWithEnt({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    return await Games.getOrCreate(ctx, { user })
  },
})

export const end = mutationWithGame({
  args: {},
  handler: async (ctx) => {
    const { game } = ctx
    await Games.end(ctx, game)
  },
})

export const getInfo = queryWithGame({
  args: {},
  handler: async (ctx) => {
    return await Games.getInfo(ctx, {
      currentPlayer: ctx.player,
      user: ctx.user,
      game: ctx.game,
    })
  },
})

export const cleanup = internalMutationWithEnt({
  args: { gameId: v.id('Games') },
  handler: (ctx, args) => {} // Games.cleanup(ctx, args),
})

export const setup = internalMutationWithEnt({
  args: {},
  handler: async (ctx) => {
    await Games.createGame(ctx, { isPublic: true })
  },
})
