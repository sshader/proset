import { v } from 'convex/values'
import { internal } from './_generated/api'
import { internalMutation, mutation } from './_generated/server'
import { getPlayer } from './getPlayer'

export default mutation({
  args: {
    gameId: v.id('Game'),
    content: v.string(),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async ({ db, auth, scheduler }, { gameId, content, isPrivate }) => {
    const player = await getPlayer(db, auth, gameId)
    isPrivate = isPrivate ?? false
    const messageId = await db.insert('Message', {
      game: gameId,
      player: isPrivate ? player._id : null,
      content,
    })
    await scheduler.runAfter(5 * 1000, internal.sendMessage.deleteMessage, {
      messageId,
    })
  },
})

export const deleteMessage = internalMutation({
  args: {
    messageId: v.id('Message'),
  },
  handler: async ({ db }, { messageId }) => {
    await db.delete(messageId)
  },
})
