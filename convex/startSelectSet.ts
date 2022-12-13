import { getPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(async ({ db, auth }, gameId: Id<'Game'>) => {
  const game = (await db.get(gameId))!
  const player = await getPlayer(db, auth, gameId)
  if (game.selectingPlayer !== null) {
    return {
      reason: 'OtherPlayerAlreadySelecting',
      selectedBy: game.selectingPlayer,
    }
  }
  await db.patch(game._id, {
    selectingPlayer: player._id,
    selectionStartTime: Date.now(),
  })
  return null
})
