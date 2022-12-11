import { DatabaseReader, query } from './_generated/server'
import { Document, Id } from './_generated/dataModel'
import { getPlayer } from './getPlayer'

export default query(async ({ db, auth }, gameId: Id<'Game'>) => {
  const game = (await db.get(gameId))!
  const currentPlayer = await getPlayer(db, auth, gameId)
  const allPlayers = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('isSystemPlayer'), false))
    .collect()
  const playerToProsets: Record<string, Document<'PlayingCard'>[][]> = {}
  for (const player of allPlayers) {
    playerToProsets[`id_${player._id.id}`] = await getProsets(
      db,
      player._id,
      gameId
    )
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
): Promise<Document<'PlayingCard'>[][]> => {
  const prosets = await db
    .query('Proset')
    .withIndex('ByPlayer', (q) => q.eq('player', playerId))
    .collect()
  return Promise.all(
    prosets.map((proset) => {
      return db
        .query('PlayingCard')
        .withIndex('ByGameAndProsetAndRank', (q) =>
          q.eq('game', gameId).eq('proset', proset._id)
        )
        .collect()
    })
  )
}
