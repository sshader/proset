import { v } from 'convex/values'
import * as User from './model/user'
import { mutationWithEnt, queryWithEnt } from './lib/functions'

export const getOrCreate = mutationWithEnt({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const result = await User.getOrCreate(ctx, sessionId)
    return result.userId
  },
})

export const getOrNull = queryWithEnt({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const userOrNull = await User.getOrNull(ctx, { sessionId })
    if (userOrNull !== null) {
      return userOrNull
    }
    return null
  },
})

export const completeOnboarding = mutationWithEnt({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    await User.completeOnboarding(ctx, user)
  },
})
