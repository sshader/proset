import { getPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { query } from './_generated/server'

export default query(
  async ({ db, auth }, { gameId }: { gameId: Id<'Game'> }) => {
    const player = await getPlayer(db, auth, gameId)
    return await db
      .query('Message')
      .withIndex('ByGameAndCreationTime', (q) =>
        q.eq('game', gameId).gte('_creationTime', Date.now() - 10 * 1000)
      )
      .filter((q) =>
        q.or(q.eq(q.field('player'), null), q.eq(q.field('player'), player._id))
      )
      .collect()
  }
)
