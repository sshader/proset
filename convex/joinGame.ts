import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  animals,
} from 'unique-names-generator'
import { PLAYER_COLORS } from './schema'

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: ' ',
  style: 'capital',
}

export default mutation(async ({ db, auth }, gameId: Id<'Game'>) => {
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
  if (player) {
    return player._id
  }
  return await db.insert('Player', {
    game: gameId,
    tokenIdentifier: identity.tokenIdentifier,
    name: uniqueNamesGenerator(customConfig), // big-donkey,
    score: 0,
    color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
    isSystemPlayer: false,
  })
})
