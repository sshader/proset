import {
  Config,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator'
import { Id } from '../_generated/dataModel'
import { MutationCtx, QueryCtx } from '../_generated/server'

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: ' ',
  style: 'capital',
}

export const getOrCreate = async (
  ctx: MutationCtx,
  sessionId: Id<'Session'> | null
): Promise<{ sessionId: Id<'Session'> | null; userId: Id<'User'> }> => {
  const { db, auth } = ctx
  const existingUserId = await getOrNull(ctx, { sessionId })
  if (existingUserId !== null) {
    return { userId: existingUserId, sessionId }
  }
  const identity = await auth.getUserIdentity()
  if (identity !== null) {
    const userId = await db.insert('User', {
      name: identity.name ?? uniqueNamesGenerator(customConfig),
      showOnboarding: true,
      identifier: identity.tokenIdentifier,
    })
    return { userId, sessionId: null }
  }
  const userId = await db.insert('User', {
    name: uniqueNamesGenerator(customConfig),
    showOnboarding: true,
    identifier: null,
  })
  const newSessionId = await db.insert('Session', { user: userId })
  await db.patch(userId, {
    identifier: newSessionId,
  })
  return { sessionId: newSessionId, userId }
}

export const getOrNull = async (
  ctx: QueryCtx,
  { sessionId }: { sessionId: Id<'Session'> | null }
) => {
  const { db, auth } = ctx
  const identity = await auth.getUserIdentity()
  if (identity !== null) {
    const user = await db
      .query('User')
      .withIndex('ByIdentifier', (q) =>
        q.eq('identifier', identity.tokenIdentifier)
      )
      .unique()
    return user?._id ?? null
  }
  if (sessionId === null) {
    return null
  }

  const user = await db
    .query('User')
    .withIndex('ByIdentifier', (q) => q.eq('identifier', sessionId))
    .unique()
  return user?._id ?? null
}

export const get = async (
  ctx: QueryCtx,
  { sessionId }: { sessionId: Id<'Session'> | null }
) => {
  const userOrNull = await getOrNull(ctx, { sessionId })
  if (userOrNull === null) {
    throw new Error('Could not find user')
  }
  return (await ctx.db.get(userOrNull))!
}

export const completeOnboarding = async (
  ctx: MutationCtx,
  userId: Id<'User'>
) => {
  await ctx.db.patch(userId, {
    showOnboarding: false,
  })
}
