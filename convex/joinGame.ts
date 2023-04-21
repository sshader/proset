import {
  adjectives,
  animals,
  Config,
  uniqueNamesGenerator,
} from 'unique-names-generator'
import { PLAYER_COLORS } from '../types/player_colors'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: ' ',
  style: 'capital',
}

export default mutation(
  async ({ db, auth }, { gameId }: { gameId: Id<'Game'> }) => {
    const identity = await auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Could not find identity')
    }
    const player = await db
      .query('Player')
      .withIndex('ByGame', (q) => q.eq('game', gameId))
      .filter((q) => q.eq(q.field('tokenIdentifier'), identity.tokenIdentifier))
      .first()
    if (player !== null) {
      return player._id
    }
    return await db.insert('Player', {
      game: gameId,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? uniqueNamesGenerator(customConfig),
      score: 0,
      color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
      isSystemPlayer: false,
    })
  }
)
