import {
  adjectives,
  animals,
  Config,
  uniqueNamesGenerator,
} from 'unique-names-generator'
import { PLAYER_COLORS } from '../types/player_colors'
import { mutation } from './_generated/server'

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: ' ',
  style: 'capital',
}

export default mutation(
  async ({ db, auth }, { gameIdStr }: { gameIdStr: string }) => {
    const identity = await auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Could not find identity')
    }
    const gameId = db.isInTable('Game', gameIdStr)
      ? gameIdStr
      : db.getStringId('Game', gameIdStr)
    if (gameId === null) {
      return null
    }
    const player = await db
      .query('Player')
      .withIndex('ByGame', (q) => q.eq('game', gameId))
      .filter((q) => q.eq(q.field('tokenIdentifier'), identity.tokenIdentifier))
      .first()
    if (player !== null) {
      return player.game
    }
    await db.insert('Player', {
      game: gameId,
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? uniqueNamesGenerator(customConfig),
      score: 0,
      color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
      isSystemPlayer: false,
    })
    return gameId
  }
)
