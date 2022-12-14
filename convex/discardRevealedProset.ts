import { getSystemPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async ({ db }, gameId: Id<'Game'>, cardIds: Array<Id<'PlayingCard'>>) => {
    const player = await getSystemPlayer(db, gameId)

    const proset = await db.insert('Proset', {
      player: player._id,
    })
    await db.patch(gameId, {
      selectingPlayer: null,
      selectionStartTime: null,
    })
    await Promise.all(
      cardIds.map((cardId) => {
        return db.patch(cardId, {
          proset,
        })
      })
    )
  }
)
