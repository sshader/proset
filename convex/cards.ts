import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import * as Cards from './model/cards'
import * as Player from './model/player'

import { mutationWithGame } from './lib/functions'

export const startSelectSet = mutationWithGame({
  args: {},
  handler: async (ctx) => {
    const { game, player } = ctx

    return Cards.startSelectSet(ctx, { game, player })
  },
})

export const select = mutationWithGame({
  args: {
    cardId: v.id('PlayingCard'),
  },
  handler: async (ctx, { cardId }) => {
    const { user, player } = ctx
    return await Cards.select(ctx, { user, player, cardId })
  },
})

export const reveal = mutationWithGame({
  args: {},
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
