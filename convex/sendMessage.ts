import { v } from 'convex/values'
import { getPlayer } from './getPlayer'
import { mutation } from './_generated/server'

export default mutation({
  args: {
    gameId: v.id('Game'),
    content: v.string(),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async ({ db, auth }, { gameId, content, isPrivate }) => {
    const player = await getPlayer(db, auth, gameId)
    isPrivate = isPrivate ?? false
    return await db.insert('Message', {
      game: gameId,
      player: isPrivate ? player._id : null,
      content,
    })
  },
})
