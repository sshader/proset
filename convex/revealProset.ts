import { z } from 'zod'
import { internal } from './_generated/api'
import { mutationWithGame } from './lib/functions'
import * as Message from './model/message'
import * as Player from './model/player'
import { findProset } from './prosetHelpers'

export default mutationWithGame({
  args: {},
  output: z.null(),
  handler: async (ctx) => {
    const { db, scheduler, player, user } = ctx
    const systemPlayer = await Player.getSystemPlayer(ctx, player.game)

    await Message.send(ctx, {
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
    return null
  },
})
