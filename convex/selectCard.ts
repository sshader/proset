import { getPlayer } from './getPlayer'
import { isProset } from './prosetHelpers'
import sendMessage from './sendMessage'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async (ctx, { cardId }: { cardId: Id<'PlayingCard'> }) => {
    const { db, auth } = ctx
    const card = (await db.get(cardId))!
    const player = await getPlayer(db, auth, card.game)
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
      await sendMessage(ctx, {
        gameId: card.game,
        content: '⭐️ You found a set!',
        isPrivate: true,
      })
      await ctx.scheduler.runAfter(2 * 1000, 'claimSet', {
        gameId: card.game,
        playerId: player._id,
      })
      return 'FoundProset'
    }
  }
)
