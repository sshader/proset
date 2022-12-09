import { Auth } from 'convex/server'
import { Id } from './_generated/dataModel'
import { DatabaseReader } from './_generated/server'

export const getPlayer = async (
  db: DatabaseReader,
  auth: Auth,
  gameId: Id<'Game'>
) => {
  const identity = await auth.getUserIdentity()
  if (!identity) {
    throw new Error('Called storeUser without authentication present')
  }
  const player = await db
    .query('Player')
    .withIndex('ByGameAndToken', (q) =>
      q.eq('game', gameId).eq('tokenIdentifier', identity.tokenIdentifier)
    )
    .first()
  if (player === null) {
    throw new Error('Could not find player matching auth and game')
  }
  return player
}
