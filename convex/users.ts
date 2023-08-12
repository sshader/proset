import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import * as User from './model/user'

export const getOrCreate = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const result = await User.getOrCreate(ctx, sessionId)
    return result.userId
  },
})

export const getOrNull = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const userIdOrNull = await User.getOrNull(ctx, { sessionId })
    if (userIdOrNull !== null) {
      return await ctx.db.get(userIdOrNull)
    }
    return null
  },
})

export const completeOnboarding = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    await User.completeOnboarding(ctx, user._id)
  },
})
