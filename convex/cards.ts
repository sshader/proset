import { v } from 'convex/values'
import * as Cards from './model/cards'
import * as Player from './model/player'

import { internalMutationWithEnt, mutationWithGame } from './lib/functions'

export const startSelectSet = mutationWithGame({
  args: {},
  handler: async (ctx) => {
    const { game, player } = ctx

    return Cards.startSelectSet(ctx, { game, player })
  },
})

export const select = mutationWithGame({
  args: {
    cardId: v.id('PlayingCards'),
  },
  handler: async (ctx, { cardId }) => {
    return Cards.select(ctx, { cardId })
  },
})

export const reveal = mutationWithGame({
  args: {},
  handler: async (ctx) => {
    return Cards.reveal(ctx)
  },
})

export const discardRevealedProset = internalMutationWithEnt({
  args: {
    gameId: v.id('Games'),
    cardIds: v.array(v.id('PlayingCards')),
  },
  handler: async (ctx, args) => {
    const player = await Player.getSystemPlayer(ctx, args.gameId)

    const game = await ctx.table("Games").getX(args.gameId)

    const prosetId = await ctx.table('Prosets').insert({
      PlayingCards: args.cardIds,
      PlayerId: player._id
    })
    await game.patch({
      selectingPlayer: null,
      selectionStartTime: null,
    })
    await Promise.all(
      args.cardIds.map((cardId) => {
        return ctx.table("PlayingCards").getX(cardId).patch({
          proset: prosetId,
        })
      })
    )
    await Cards.clearSelectSet(ctx, game)
  },
})

export const claimSet = internalMutationWithEnt({
  args: {
    gameId: v.id('Games'),
    playerId: v.id('Players'),
  },
  handler: async (ctx, { gameId, playerId }) => {
    const game = await ctx.table("Games").getX(gameId)
    const player = await ctx.table("Players").getX(playerId)
    await Cards.claimSet(ctx, {
      game: game,
      player: player,
    })
  },
})

export const maybeClearSelectSet = internalMutationWithEnt({
  args: {
    gameId: v.id('Games'),
  },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.table("Games").getX(gameId)
    await Cards.maybeClearSelectSet(ctx, game)
  },
})
