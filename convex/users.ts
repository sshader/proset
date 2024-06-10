import { v } from 'convex/values'
import { mutationWithEnt, queryWithEnt } from './lib/functions'
import * as User from './model/user'

export const getOrCreate = mutationWithEnt({
  args: { sessionId: v.string() },
  returns: v.id('Users'),
  handler: async (ctx, { sessionId }) => {
    const result = await User.getOrCreate(ctx, sessionId)
    return result.userId
  },
})

export const getOrNull = queryWithEnt({
  args: { sessionId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      // system fields
      _id: v.id('Users'),
      _creationTime: v.number(),
      // fields I copied from my schema
      name: v.string(),
      showOnboarding: v.boolean(),
      isGuest: v.boolean(),
      // field with a unique constraint
      identifier: v.string(),
      // ent fields that I had to kinda guess and check
    })
  ),
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
