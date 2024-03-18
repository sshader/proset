import { v } from 'convex/values'
import { internalMutation, mutation } from './_generated/server'
import { mutationWithGame, queryWithGame } from './lib/functions'
import * as Games from './model/game'
import * as Players from './model/player'
import * as User from './model/user'
import { z } from 'zod'
import { zid } from 'convex-helpers/server/zod'

export const start = mutation({
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

export const getOrCreate = mutation({
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
  output: z.object({
    game: z.object({

    }),
    currentPlayer: z.object({
      showOnboarding: z.boolean(),
      isGuest: z.boolean(),
      _id: zid("Player"),
      _creationTime: z.number(),
      game: zid("Game"),
      user: zid("User"),
      name: z.string(),
      score: z.number(),
      color: z.string(),
      isSystemPlayer: z.boolean()
    }),
    otherPlayers: z.array(z.object({
      _id: zid("Player"),
      _creationTime: z.number(),
      game: zid("Game"),
      user: zid("User"),
      name: z.string(),
      score: z.number(),
      color: z.string(),
      isSystemPlayer: z.boolean()
    })),
    playerToProsets: z.any()
  }),
  handler: async (ctx) => {
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
