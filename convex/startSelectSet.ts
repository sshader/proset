import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async ({ db }, gameId: Id<'Game'>, playerId: Id<'Player'>) => {
    const game = (await db.get(gameId))!
    if (game.selectingPlayer !== null) {
      return {
        reason: 'OtherPlayerAlreadySelecting',
        selectedBy: game.selectingPlayer,
      }
    }
    db.patch(game._id, {
      selectingPlayer: playerId,
      selectionStartTime: Date.now(),
    })
    return null
  }
)
