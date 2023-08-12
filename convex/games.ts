import { v } from 'convex/values'
import { internalMutation, mutation } from './_generated/server'
import { mutationWithGame, queryWithGame } from './lib/functions'
import * as Games from './model/game'
import * as Players from './model/player'
import * as User from './model/user'

export const start = mutation({
  args: {
    sessionId: v.union(v.id('Session'), v.null()),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    const gameId = await Games.createGame(ctx, { isPublic: false })
    await Players.joinGame(ctx, { gameId, user })
    return { gameId }
  },
})

export const getOrCreate = mutation({
  args: {
    sessionId: v.union(v.id('Session'), v.null()),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    return await Games.getOrCreate(ctx, { user })
  },
})

export const end = mutationWithGame({
  args: {},
  handler: async (ctx, {}) => {
    const { game } = ctx
    await Games.end(ctx, game)
  },
})

export const getInfo = queryWithGame({
  args: { sessionId: v.union(v.null(), v.id('Session')), gameId: v.id('Game') },
  handler: async (ctx, {}) => {
    return await Games.getInfo(ctx, {
      currentPlayer: ctx.player,
      user: ctx.user,
      game: ctx.game,
    })
  },
})

export const cleanup = internalMutation({
  args: { gameId: v.id('Game') },
  handler: (ctx, args) => Games.cleanup(ctx, args),
})

export const setup = internalMutation({
  args: {},
  handler: async (ctx) => {
    await Games.createGame(ctx, { isPublic: true })
  },
})
