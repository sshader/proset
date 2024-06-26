import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { mutationWithGame, queryWithGame, } from './lib/functions'
import * as Message from './model/message'
import { Doc } from './_generated/dataModel'

export const send = mutationWithGame({
  args: {
    content: v.string(),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, { content, isPrivate }) => {
    await Message.send(ctx, {
      content,
      isPrivate,
    })
  },
})

export const remove = internalMutation({
  args: {
    messageId: v.id('Messages'),
  },
  handler: async ({ db }, { messageId }) => {
    await db.delete(messageId)
  },
})

export const list = queryWithGame({
  args: {},
  handler: async (ctx): Promise<Array<Doc<"Messages">>> => {
    const messages = await ctx.game.edge("Messages")
    return messages.filter(m => m._creationTime >= Date.now() - 10 * 1000 && (m.player === null || m.player === ctx.player._id))
  },
})
