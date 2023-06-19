import { Auth } from 'convex/server'
import { Doc, Id } from './_generated/dataModel'
import { DatabaseReader } from './_generated/server';

export const getPlayer = async (
  db: DatabaseReader,
  auth: Auth,
  gameId: Id<'Game'>
) => {
  const identity = await auth.getUserIdentity()
  if (identity == null) {
    throw new Error('Called storeUser without authentication present')
  }
  const player = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('tokenIdentifier'), identity.tokenIdentifier))
    .first()
  if (player === null) {
    throw new Error('Could not find player matching auth and game')
  }
  return player
}

export const getSystemPlayer = async (
  db: DatabaseReader,
  gameId: Id<'Game'>
): Promise<Doc<'Player'>> => {
  const player = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('isSystemPlayer'), true))
    .unique()
  return player!
}
