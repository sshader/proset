import { internal } from '../_generated/api'
import { Id } from '../_generated/dataModel'
import { MutationCtx, Ent, BaseMutationCtx } from '../lib/functions'
import { findProset, isProset } from '../prosetHelpers'
import * as Message from './message'
import * as Player from './player'

export const claimSet = async (
  ctx: BaseMutationCtx,
  { game, player }: { game: Ent<'Games'>; player: Ent<'Players'> }
) => {
  const currentlySelected = (await game.edge("PlayingCards")).filter(p => p.selectedBy === player._id)
  if (isProset(currentlySelected)) {
    const prosetId = await ctx.table("Prosets").insert({
      PlayingCards: currentlySelected.map(p => p._id),
      PlayerId: player._id
    })
    await Promise.all(
      currentlySelected.map(async (card) => {
        return ctx.table("PlayingCards").getX(card._id).patch({
          selectedBy: null,
          proset: prosetId
        })
      })
    )
    await clearSelectSet(ctx, game)
    await ctx.table("Players").getX(player._id).patch({
      score: player.score + 1,
    })
  }
}

export const clearSelectSet = async (ctx: BaseMutationCtx, game: Ent<'Games'>) => {
  const selectingPlayer = game.selectingPlayer
  await ctx.table("Games").getX(game._id).patch({
    selectingPlayer: null,
    selectionStartTime: null,
  })
  if (selectingPlayer != null) {
    const currentlySelected = (await game.edge("PlayingCards")).filter(p => p.selectedBy === selectingPlayer)
    await Promise.all(
      currentlySelected.map(async (card) => {
        return ctx.table("PlayingCards").getX(card._id).patch({
          selectedBy: null,
        })
      })
    )
  }
}

export const maybeClearSelectSet = async (
  ctx: BaseMutationCtx,
  game: Ent<'Games'>
) => {
  if (game.selectingPlayer === null) {
    return
  }
  if (Date.now() - game.selectionStartTime! > 20 * 1000) {
    await clearSelectSet(ctx, game)
    const player = await ctx.table("Players").getX(game.selectingPlayer)
    await player.patch({
      score: player!.score - 1,
    })
  }
}

export const startSelectSet = async (
  ctx: MutationCtx,
  { game, player }: { game: Ent<'Games'>; player: Ent<'Players'> }
) => {

  if (game.selectingPlayer !== null) {
    return {
      reason: 'Another player is already selecting!',
      selectedBy: game.selectingPlayer,
    }
  }
  await ctx.table("Users").getX(player.UserId).patch({
    showOnboarding: false,
  })
  await ctx.table("Games").getX(game._id).patch({
    selectingPlayer: player._id,
    selectionStartTime: Date.now(),
  })
  await ctx.scheduler.runAfter(20 * 1000, internal.cards.maybeClearSelectSet, {
    gameId: game._id,
  })
  return null
}

export const select = async (
  ctx: MutationCtx,
  {
    cardId,
  }: { cardId: Id<'PlayingCards'> }
) => {
  const { game, user, player } = ctx;
  let currentlySelected = (await game.edge("PlayingCards")).filter(p => p.selectedBy === player._id)

  if (isProset(currentlySelected)) {
    // don't allow selecting more cards
    return
  }
  const card = await ctx.table("PlayingCards").getX(cardId);

  if (card.selectedBy !== null) {
    await card.patch({
      selectedBy: null,
    })
  } else {
    await card.patch({
      selectedBy: player._id,
    })
  }

  currentlySelected = (await game.edge("PlayingCards")).filter(p => p.selectedBy === player._id)

  if (isProset(currentlySelected)) {
    await Message.send(ctx, {
      content: `⭐️ ${user.name} found a set!`,
      isPrivate: false,
    })
    await ctx.scheduler.runAfter(2 * 1000, internal.cards.claimSet, {
      gameId: game._id,
      playerId: player._id,
    })
    return 'FoundProset'
  }
}

export const reveal = async (
  ctx: MutationCtx,
) => {
  const { player, user } = ctx
  const systemPlayer = await Player.getSystemPlayer(ctx, player.GameId)

  await Message.send(ctx, {
    content: `👀 ${user.name} is revealing a set`,
    isPrivate: false,
  })

  await ctx.table("Games").getX(player.GameId).patch({
    selectingPlayer: systemPlayer._id,
    selectionStartTime: Date.now(),
  })

  const cards = await ctx.db
    .query('PlayingCards')
    .withIndex('ByGameAndProsetAndRank', (q) =>
      q.eq('GameId', player.GameId).eq('proset', null)
    )
    .take(7)
  const prosetCards = findProset(cards)
  await Promise.all(
    prosetCards!.map(async (card) => {
      return await ctx.table("PlayingCards").getX(card._id).patch({
        selectedBy: systemPlayer._id,
      })
    })
  )
  const cardIds = prosetCards.map((card) => card._id)
  await ctx.scheduler.runAfter(5 * 1000, internal.cards.discardRevealedProset, {
    gameId: player.GameId,
    cardIds,
  })
}
