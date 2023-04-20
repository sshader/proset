import { v } from 'convex/values'
import { clearSelectSet } from './maybeClearSelectSet'
import { isProset } from './prosetHelpers'
import { internalMutation } from './_generated/server'

export default internalMutation({
  args: {
    gameId: v.id('Game'),
    playerId: v.id('Player'),
  },
  handler: async ({ db }, { gameId, playerId }) => {
    const currentlySelected = await db
      .query('PlayingCard')
      .withIndex('ByGameAndProsetAndSelectedBy', (q) => {
        return q
          .eq('game', gameId)
          .eq('proset', null)
          .eq('selectedBy', playerId)
      })
      .collect()
    if (isProset(currentlySelected)) {
      const prosetId = await db.insert('Proset', {
        player: playerId,
      })
      await Promise.all(
        currentlySelected.map((selectedCard) => {
          return db.patch(selectedCard._id, {
            proset: prosetId,
          })
        })
      )
      await clearSelectSet(db, gameId)
      const player = (await db.get(playerId))!
      await db.patch(playerId, {
        score: player.score + 1,
      })
    }
  },
})
