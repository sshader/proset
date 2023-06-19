import { api } from "./_generated/api";
import { getPlayer, getSystemPlayer } from './getPlayer'
import { findProset } from './prosetHelpers'
import sendMessage from './sendMessage'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server';

export default mutation(async (ctx, { gameId }: { gameId: Id<'Game'> }) => {
  const { db, auth, scheduler } = ctx
  const player = await getPlayer(db, auth, gameId)
  const systemPlayer = await getSystemPlayer(db, gameId)

  await sendMessage(ctx, {
    gameId,
    content: `👀 ${player.name} is revealing a set`,
    isPrivate: false,
  })

  await db.patch(gameId, {
    selectingPlayer: systemPlayer._id,
    selectionStartTime: Date.now(),
  })

  const cards = await db
    .query('PlayingCard')
    .withIndex('ByGameAndProsetAndRank', (q) =>
      q.eq('game', gameId).eq('proset', null)
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
  await scheduler.runAfter(5 * 1000, api.discardRevealedProset.default, {
    gameId,
    cardIds,
  })
})
