import { Id, Document } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async ({ db }, gameId: Id<'Game'>, cardIds: Id<'PlayingCard'>[]) => {
    const player = await db
      .query('Player')
      .withIndex('ByGameAndSystemPlayer', (q) =>
        q.eq('game', gameId).eq('isSystemPlayer', true)
      )
      .unique()

    const proset = await db.insert('Proset', {
      player: player._id,
    })
    cardIds.forEach((cardId) => {
      db.patch(cardId, {
        proset,
      })
    })
  }
)
