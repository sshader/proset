import { getPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async (
    { db, auth },
    args: {
      gameId: Id<'Game'>
      content: string
      isPrivate?: boolean
    }
  ) => {
    const player = await getPlayer(db, auth, args.gameId)
    const isPrivate = args.isPrivate ?? false
    return await db.insert('Message', {
      game: args.gameId,
      player: isPrivate ? player._id : null,
      content: args.content,
    })
  }
)
