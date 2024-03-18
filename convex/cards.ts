import { v } from 'convex/values'
import { action, internalMutation, mutation } from './_generated/server'
import * as Cards from './model/cards'
import * as Player from './model/player'

import { mutaiton, mutationWithGame } from './lib/functions'
import { zid } from 'convex-helpers/server/zod'
import { z } from 'zod'
import { Anthropic } from "@anthropic-ai/sdk"
import { api } from './_generated/api'

export const startSelectSet = mutationWithGame({
  args: {},
  output: z.union([z.null(), z.object({
    reason: z.string(),
  })]),
  handler: async (ctx) => {
    const { game, player } = ctx

    return Cards.startSelectSet(ctx, { game, player })
  },
})

export const select = mutationWithGame({
  args: {
    cardId: zid('PlayingCard'),
  },
  output: z.null(),
  handler: async (ctx, { cardId }) => {
    const { user, player } = ctx
    await Cards.select(ctx, { user, player, cardId })
    return null;
  },
})

export const reveal = mutationWithGame({
  args: {},
  output: z.null(),
  handler: async (ctx) => {
    const { player, user } = ctx
    return await Cards.reveal(ctx, { player, user })
  },
})

export const discardRevealedProset = internalMutation({
  args: {
    gameId: v.id('Game'),
    cardIds: v.array(v.id('PlayingCard')),
  },
  handler: async (ctx, args) => {
    const { db } = ctx
    const player = await Player.getSystemPlayer(ctx, args.gameId)
    const game = (await db.get(args.gameId))!

    const proset = await db.insert('Proset', {
      player: player._id,
    })
    await db.patch(args.gameId, {
      selectingPlayer: null,
      selectionStartTime: null,
    })
    await Promise.all(
      args.cardIds.map((cardId) => {
        return db.patch(cardId, {
          proset,
        })
      })
    )
    await Cards.clearSelectSet(ctx, game)
  },
})

export const claimSet = internalMutation({
  args: {
    gameId: v.id('Game'),
    playerId: v.id('Player'),
  },
  handler: async (ctx, { gameId, playerId }) => {
    const game = await ctx.db.get(gameId)
    const player = await ctx.db.get(playerId)
    await Cards.claimSet(ctx, {
      game: game!,
      player: player!,
    })
  },
})

export const maybeClearSelectSet = internalMutation({
  args: {
    gameId: v.id('Game'),
  },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId)
    await Cards.maybeClearSelectSet(ctx, game!)
  },
})
