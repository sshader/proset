import { getSystemPlayer } from './getPlayer'
import { clearSelectSet } from './maybeClearSelectSet'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server';

export default mutation(
  async (
    { db },
    args: { gameId: Id<'Game'>; cardIds: Array<Id<'PlayingCard'>> }
  ) => {
    const player = await getSystemPlayer(db, args.gameId)

    const proset = await db.insert('Proset', {
      player: player._id,
    })
    await db.patch(args.gameId, {
      selectingPlayer: null,
      selectionStartTime: null,
    })
    await Promise.all(
      args.cardIds.map((cardId) => {
        return db.patch(cardId, {
          proset,
        })
      })
    )
    await clearSelectSet(db, args.gameId)
  }
)
