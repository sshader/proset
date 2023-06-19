import { api } from "./_generated/api";
import { getPlayer } from './players'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server';

export default mutation(async (ctx, { gameId }: { gameId: Id<'Game'> }) => {
  const { db, scheduler } = ctx
  const game = (await db.get(gameId))!
  const player = await getPlayer(ctx, gameId)
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
  await scheduler.runAfter(20 * 1000, api.maybeClearSelectSet.default, { gameId })
  return null
})
