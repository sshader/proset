import { internal } from '../_generated/api'
import { Doc, Id } from '../_generated/dataModel'
import { MutationCtx } from '../_generated/server'
import { findProset, isProset } from '../prosetHelpers'
import * as Message from './message'
import * as Player from './player'

export const claimSet = async (
  ctx: MutationCtx,
  { game, player }: { game: Doc<'Game'>; player: Doc<'Player'> }
) => {
  const { db } = ctx
  const currentlySelected = await db
    .query('PlayingCard')
    .withIndex('ByGameAndProsetAndSelectedBy', (q) => {
      return q
        .eq('game', player.game)
        .eq('proset', null)
        .eq('selectedBy', player._id)
    })
    .collect()
  if (isProset(currentlySelected)) {
    const prosetId = await db.insert('Proset', {
      player: player._id,
    })
    await Promise.all(
      currentlySelected.map((selectedCard) => {
        return db.patch(selectedCard._id, {
          proset: prosetId,
        })
      })
    )
    await clearSelectSet(ctx, game)
    await db.patch(player._id, {
      score: player.score + 1,
    })
  }
}

export const clearSelectSet = async (ctx: MutationCtx, game: Doc<'Game'>) => {
  const { db } = ctx
  const selectingPlayer = game.selectingPlayer
  await db.patch(game._id, {
    selectingPlayer: null,
    selectionStartTime: null,
  })
  if (selectingPlayer != null) {
    const currentlySelected = await db
      .query('PlayingCard')
      .withIndex('ByGameAndProsetAndSelectedBy', (q) => {
        return q
          .eq('game', game._id)
          .eq('proset', null)
          .eq('selectedBy', selectingPlayer)
      })
      .collect()
    await Promise.all(
      currentlySelected.map(async (card) => {
        return await db.patch(card._id, {
          selectedBy: null,
        })
      })
    )
  }
}

export const maybeClearSelectSet = async (
  ctx: MutationCtx,
  game: Doc<'Game'>
) => {
  const { db } = ctx
  if (game.selectingPlayer === null) {
    return
  }
  if (Date.now() - game.selectionStartTime! > 20 * 1000) {
    await clearSelectSet(ctx, game)
    const player = await db.get(game.selectingPlayer)
    await db.patch(player!._id, {
      score: player!.score - 1,
    })
  }
}

export const startSelectSet = async (
  ctx: MutationCtx,
  { game, player }: { game: Doc<'Game'>; player: Doc<'Player'> }
) => {
  const { db, scheduler } = ctx

  if (game.selectingPlayer !== null) {
    return {
      reason: 'Another player is already selecting!',
      selectedBy: game.selectingPlayer,
    }
  }
  await db.patch(player.user, {
    showOnboarding: false,
  })
  await db.patch(game._id, {
    selectingPlayer: player._id,
    selectionStartTime: Date.now(),
  })
  await scheduler.runAfter(20 * 1000, internal.cards.maybeClearSelectSet, {
    gameId: game._id,
  })
  return null
}

export const select = async (
  ctx: MutationCtx,
  {
    user,
    player,
    cardId,
  }: { user: Doc<'User'>; player: Doc<'Player'>; cardId: Id<'PlayingCard'> }
) => {
  const { db } = ctx
  const card = (await db.get(cardId))!
  let currentlySelected = await db
    .query('PlayingCard')
    .withIndex('ByGameAndProsetAndSelectedBy', (q) => {
      return q
        .eq('game', card.game)
        .eq('proset', null)
        .eq('selectedBy', player._id)
    })
    .collect()

  if (isProset(currentlySelected)) {
    // don't allow selecting more cards
    return
  }

  if (card.selectedBy !== null) {
    await db.patch(card._id, {
      selectedBy: null,
    })
  } else {
    await db.patch(card._id, {
      selectedBy: player._id,
    })
  }

  currentlySelected = await db
    .query('PlayingCard')
    .withIndex('ByGameAndProsetAndSelectedBy', (q) => {
      return q
        .eq('game', card.game)
        .eq('proset', null)
        .eq('selectedBy', player._id)
    })
    .collect()

  if (isProset(currentlySelected)) {
    await Message.send(ctx, {
      content: `⭐️ ${user.name} found a set!`,
      isPrivate: false,
      player,
    })
    await ctx.scheduler.runAfter(2 * 1000, internal.cards.claimSet, {
      gameId: card.game,
      playerId: player._id,
    })
    return 'FoundProset'
  }
}

export const reveal = async (
  ctx: MutationCtx,
  { player, user }: { player: Doc<'Player'>; user: Doc<'User'> }
) => {
  const { db, scheduler } = ctx
  const systemPlayer = await Player.getSystemPlayer(ctx, player.game)

  Message.send(ctx, {
    content: `👀 ${user.name} is revealing a set`,
    isPrivate: false,
    player,
  })

  await db.patch(player.game, {
    selectingPlayer: systemPlayer._id,
    selectionStartTime: Date.now(),
  })

  const cards = await db
    .query('PlayingCard')
    .withIndex('ByGameAndProsetAndRank', (q) =>
      q.eq('game', player.game).eq('proset', null)
    )
    .take(7)
  const prosetCards = findProset(cards)
  await Promise.all(
    prosetCards!.map(async (card) => {
      return await db.patch(card._id, {
        selectedBy: systemPlayer._id,
      })
    })
  )
  const cardIds = prosetCards!.map((card) => card._id)
  await scheduler.runAfter(5 * 1000, internal.cards.discardRevealedProset, {
    gameId: player.game,
    cardIds,
  })
}
