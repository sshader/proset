import { getPlayer } from './getPlayer'
import { Document, Id } from './_generated/dataModel'
import { DatabaseReader, query } from './_generated/server'

export default query(async ({ db, auth }, gameId: Id<'Game'>) => {
  const game = (await db.get(gameId))!
  const currentPlayer = await getPlayer(db, auth, gameId)
  const allPlayers = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('isSystemPlayer'), false))
    .collect()
  const playerToProsets: Map<string, Document<'PlayingCard'>[][]> = new Map()
  for (const player of allPlayers) {
    const prosets = await getProsets(db, player._id, gameId)
    playerToProsets.set(player._id.id, prosets)
  }
  const otherPlayers = allPlayers.filter(
    (p) => !p._id.equals(currentPlayer._id)
  )
  return { game, currentPlayer, otherPlayers, playerToProsets }
})

const getProsets = async (
  db: DatabaseReader,
  playerId: Id<'Player'>,
  gameId: Id<'Game'>
): Promise<Array<Array<Document<'PlayingCard'>>>> => {
  const prosets = await db
    .query('Proset')
    .withIndex('ByPlayer', (q) => q.eq('player', playerId))
    .collect()
  return await Promise.all(
    prosets.map(async (proset) => {
      return await db
        .query('PlayingCard')
        .withIndex('ByGameAndProsetAndRank', (q) =>
          q.eq('game', gameId).eq('proset', proset._id)
        )
        .collect()
    })
  )
}
