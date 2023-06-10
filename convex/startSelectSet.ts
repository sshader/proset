import { getPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async ({ db, auth, scheduler }, { gameId }: { gameId: Id<'Game'> }) => {
    const game = (await db.get(gameId))!
    const player = await getPlayer(db, auth, gameId)
    if (game.selectingPlayer !== null) {
      return {
        reason: 'Another player is already selecting!',
        selectedBy: game.selectingPlayer,
      }
    }
    await db.patch(game._id, {
      selectingPlayer: player._id,
      selectionStartTime: Date.now(),
    })
    await scheduler.runAfter(20 * 1000, 'maybeClearSelectSet', { gameId })
    return null
  }
)
