import { Id } from './_generated/dataModel'
import { DatabaseWriter, mutation } from './_generated/server'

export default mutation(async ({ db }, gameId: Id<'Game'>) => {
  const game = (await db.get(gameId))!
  if (game.selectingPlayer === null) {
    return
  }
  if (Date.now() - game.selectionStartTime! > 20 * 1000) {
    clearSelectSet(db, game._id)
  }
})

export const clearSelectSet = async (
  db: DatabaseWriter,
  gameId: Id<'Game'>
) => {
  const game = (await db.get(gameId))!
  const selectingPlayer = game.selectingPlayer
  db.patch(gameId, {
    selectingPlayer: null,
    selectionStartTime: null,
  })
  if (selectingPlayer) {
    const currentlySelected = await db
      .query('PlayingCard')
      .withIndex('ByGameAndProsetAndSelectedBy', (q) => {
        return q
          .eq('game', gameId)
          .eq('proset', null)
          .eq('selectedBy', selectingPlayer)
      })
      .collect()
    currentlySelected.forEach((card) => {
      db.patch(card._id, {
        selectedBy: null,
      })
    })
  }
}
