import { Id } from './_generated/dataModel'
import { DatabaseWriter, mutation } from './_generated/server'

export default mutation(async ({ db }, gameId: Id<'Game'>) => {
  const game = (await db.get(gameId))!
  if (game.selectingPlayer === null) {
    return
  }
  if (Date.now() - game.selectionStartTime! > 20 * 1000) {
    await clearSelectSet(db, game._id)
    const player = await db.get(game.selectingPlayer)
    await db.patch(player!._id, {
      score: player!.score - 1,
    })
  }
})

export const clearSelectSet = async (
  db: DatabaseWriter,
  gameId: Id<'Game'>
) => {
  const game = (await db.get(gameId))!
  const selectingPlayer = game.selectingPlayer
  await db.patch(gameId, {
    selectingPlayer: null,
    selectionStartTime: null,
  })
  if (selectingPlayer != null) {
    const currentlySelected = await db
      .query('PlayingCard')
      .withIndex('ByGameAndProsetAndSelectedBy', (q) => {
        return q
          .eq('game', gameId)
          .eq('proset', null)
          .eq('selectedBy', selectingPlayer)
      })
      .collect()
    await Promise.all(
      currentlySelected.map((card) => {
        return db.patch(card._id, {
          selectedBy: null,
        })
      })
    )
  }
}
