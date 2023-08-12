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
  sessionId: string
): Promise<{ userId: Id<'User'> }> => {
  const { db, auth } = ctx
  const existingUserId = await getOrNull(ctx, { sessionId })
  console.log('existingUserId', existingUserId)
  const identity = await auth.getUserIdentity()
  if (existingUserId !== null) {
    const existingUser = (await db.get(existingUserId))!
    if (existingUser.isGuest && identity !== null) {
      await db.patch(existingUser._id, {
        name: identity.name ?? existingUser.name,
        identifier: identity.tokenIdentifier,
        isGuest: false,
      })
    }
    return { userId: existingUserId }
  }

  if (identity !== null) {
    console.log('creating full user')
    const userId = await db.insert('User', {
      name: identity.name ?? uniqueNamesGenerator(customConfig),
      showOnboarding: true,
      identifier: identity.tokenIdentifier,
      isGuest: false,
    })
    return { userId }
  }
  console.log('creating guest user')
  const userId = await db.insert('User', {
    name: uniqueNamesGenerator(customConfig),
    showOnboarding: true,
    identifier: sessionId,
    isGuest: true,
  })
  return { userId }
}

export const getOrNull = async (
  ctx: QueryCtx,
  { sessionId }: { sessionId: string }
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
    if (user !== null) {
      return user._id
    }
  }

  const user = await db
    .query('User')
    .withIndex('ByIdentifier', (q) => q.eq('identifier', sessionId))
    .unique()
  return user?._id ?? null
}

export const get = async (
  ctx: QueryCtx,
  { sessionId }: { sessionId: string }
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
