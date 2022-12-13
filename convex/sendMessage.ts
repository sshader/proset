import { getPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async (
    { db, auth },
    gameId: Id<'Game'>,
    content: string,
    isPrivate = false
  ) => {
    const player = await getPlayer(db, auth, gameId)
    return await db.insert('Message', {
      game: gameId,
      player: isPrivate ? player._id : null,
      content
    })
  }
)
