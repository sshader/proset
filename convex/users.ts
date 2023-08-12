import { v } from 'convex/values'
import { mutation } from './_generated/server'
import * as User from './model/user'

export const getOrCreate = mutation({
  args: { sessionId: v.union(v.null(), v.string()) },
  handler: async (ctx, { sessionId }) => {
    const normalizedId =
      sessionId !== null ? ctx.db.normalizeId('Session', sessionId) : null
    const result = await User.getOrCreate(ctx, normalizedId)
    return result.sessionId
  },
})

export const completeOnboarding = mutation({
  args: { sessionId: v.union(v.null(), v.id('Session')) },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    await User.completeOnboarding(ctx, user._id)
  },
})
