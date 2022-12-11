import { DatabaseReader, query } from '../_generated/server'
import { Document, Id } from '../_generated/dataModel'
import { getPlayer } from '../getPlayer'

export default query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity()
  if (!identity) {
    throw new Error('Called storeUser without authentication present')
  }
  const players = await db
    .query('Player')
    .withIndex('ByToken', (q) =>
      q.eq('tokenIdentifier', identity.tokenIdentifier)
    )
    .take(10)
  const games = await Promise.all(
    players.map(async (player) => {
      return await db.get(player.game)
    })
  )
  return games.map((game) => {
    return {
      ...game,
      numPlayers: 1,
    }
  })
})
