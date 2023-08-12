import { v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { mutationWithGame, queryWithGame } from './lib/functions'
import * as Message from './model/message'

export const send = mutationWithGame({
  args: {
    content: v.string(),
    isPrivate: v.optional(v.boolean()),
  },
  handler: async (ctx, { content, isPrivate }) => {
    await Message.send(ctx, {
      content,
      isPrivate,
      player: ctx.player,
    })
  },
})

export const remove = internalMutation({
  args: {
    messageId: v.id('Message'),
  },
  handler: async ({ db }, { messageId }) => {
    await db.delete(messageId)
  },
})

export const list = queryWithGame({
  args: {},
  handler: async (ctx) => {
    const { db, player } = ctx
    return await db
      .query('Message')
      .withIndex('ByGameAndCreationTime', (q) =>
        q.eq('game', player.game).gte('_creationTime', Date.now() - 10 * 1000)
      )
      .filter((q) =>
        q.or(q.eq(q.field('player'), null), q.eq(q.field('player'), player._id))
      )
      .collect()
  },
})
