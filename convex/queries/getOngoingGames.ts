import { Document } from '../_generated/dataModel'
import { DatabaseReader, query } from '../_generated/server'

export default query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity()
  if (!identity) {
    return await getAllGames(db)
  } else {
    return await getGamesForUser(db, identity.tokenIdentifier)
  }
})

const getAllGames = async (db: DatabaseReader) => {
  const games = await db
    .query('Game')
    .filter((q) => q.eq(q.field('inProgress'), true))
    .take(10)
  return await getGamesInfo(db, games)
}

const getGamesInfo = async (db: DatabaseReader, games: Array<Document<'Game'>>) => {
  return await Promise.all(
    games.map(async (game) => {
      const players = await db
        .query('Player')
        .withIndex('ByGame', (q) => q.eq('game', game._id))
        .collect()
      return {
        ...game,
        // subtract off system player
        numPlayers: players.length - 1
      }
    })
  )
}

const getGamesForUser = async (db: DatabaseReader, tokenIdentifier: string) => {
  const players = await db
    .query('Player')
    .withIndex('ByToken', (q) => q.eq('tokenIdentifier', tokenIdentifier))
    .take(10)
  const games = await Promise.all(
    players.map(async (player) => {
      return (await db.get(player.game))!
    })
  )
  return await getGamesInfo(
    db,
    games.filter((game) => game.inProgress)
  )
}
