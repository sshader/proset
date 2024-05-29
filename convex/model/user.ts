import {
  Config,
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator'
import { Id } from '../_generated/dataModel'
import { BaseMutationCtx, BaseQueryCtx, Ent } from '../lib/functions'
import { LOG_TOPICS } from '../lib/logger'

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: ' ',
  style: 'capital',
}

export const getOrCreate = async (
  ctx: BaseMutationCtx,
  sessionId: string
): Promise<{ userId: Id<'Users'> }> => {
  const { db, auth } = ctx
  const existingUser = await getOrNull(ctx, { sessionId })
  const identity = await auth.getUserIdentity()
  if (existingUser !== null) {
    if (existingUser.isGuest && identity !== null) {
      await ctx.table("Users").getX(existingUser._id).patch({
          name: identity.name ?? existingUser.name,
          identifier: identity.tokenIdentifier,
          isGuest: false,
      })
    }
    return { userId: existingUser._id }
  }

  if (identity !== null) {
    const userId = await db.insert('Users', {
      name: identity.name ?? uniqueNamesGenerator(customConfig),
      showOnboarding: true,
      identifier: identity.tokenIdentifier,
      isGuest: false,
    })
    ctx.logger.log(LOG_TOPICS.User, { userId }, "New user created")
    return { userId }
  }
  const userId = await db.insert('Users', {
    name: uniqueNamesGenerator(customConfig),
    showOnboarding: true,
    identifier: sessionId,
    isGuest: true,
  })
  return { userId }
}

export const getOrNull = async (
  ctx: BaseQueryCtx,
  { sessionId }: { sessionId: string }
) => {
  const identity = await ctx.auth.getUserIdentity()
  if (identity !== null) {
    const user = await ctx.table("Users").get("identifier", identity.tokenIdentifier);
    if (user !== null) {
      return user
    }
  }

  const user = await ctx.table("Users").get("identifier", sessionId);
  return user ?? null
}

export const get = async (
  ctx: BaseQueryCtx,
  { sessionId }: { sessionId: string }
) => {
  const userOrNull = await getOrNull(ctx, { sessionId })
  if (userOrNull === null) {
    throw new Error('Could not find user')
  }
  return userOrNull
}

export const completeOnboarding = async (
  ctx: BaseMutationCtx,
  user: Ent<"Users">
) => {
  ctx.logger.log(LOG_TOPICS.User, { userId: user._id }, "Onboarding completed")
  await ctx.table("Users").getX(user._id).patch({
    showOnboarding: false,
  })
}
