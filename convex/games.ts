import { v } from 'convex/values'
import { getPlayer } from './getPlayer'
import { Doc, Id } from './_generated/dataModel'
import {
  DatabaseReader,
  internalMutation,
  mutation,
  MutationCtx,
  query,
} from './_generated/server'

export const getInfo = query({
  args: { gameId: v.id('Game') },
  handler: async ({ db, auth }, { gameId }) => {
    const game = (await db.get(gameId))!
    const currentPlayer = await getPlayer(db, auth, gameId)
    const allPlayers = await db
      .query('Player')
      .withIndex('ByGame', (q) => q.eq('game', gameId))
      .filter((q) => q.eq(q.field('isSystemPlayer'), false))
      .collect()
    const playerToProsets: Map<string, Doc<'PlayingCard'>[][]> = new Map()
    for (const player of allPlayers) {
      const prosets = await getProsets(db, player._id, gameId)
      playerToProsets.set(player._id.id, prosets)
    }
    const otherPlayers = allPlayers.filter(
      (p) => !p._id.equals(currentPlayer._id)
    )
    return { game, currentPlayer, otherPlayers, playerToProsets }
  },
})

export const cleanup = async (
  { db }: MutationCtx,
  { gameId }: { gameId: Id<'Game'> }
) => {
  const allPlayers = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .collect()
  for (const player of allPlayers) {
    const prosets = await db
      .query('Proset')
      .withIndex('ByPlayer', (q) => q.eq('player', player._id))
      .collect()
    for (const p of prosets) {
      await db.delete(p._id)
    }
    await db.delete(player._id)
  }
  const cards = await db
    .query('PlayingCard')
    .withIndex('ByGameAndProsetAndRank', (q) => q.eq('game', gameId))
    .collect()
  for (const c of cards) {
    await db.delete(c._id)
  }
  const game = await db.get(gameId)
  if (game !== null) {
    await db.delete(game._id)
  }
}

export const internalCleanup = internalMutation({
  args: { gameId: v.id('Game') },
  handler: cleanup,
})

export const end = mutation({
  args: { gameId: v.id('Game') },
  handler: async ({ db, auth, scheduler }, { gameId }) => {
    await getPlayer(db, auth, gameId)
    await db.patch(gameId, {
      inProgress: false,
    })
    scheduler.runAfter(2000, 'games:internalCleanup', { gameId })
  },
})

const getProsets = async (
  db: DatabaseReader,
  playerId: Id<'Player'>,
  gameId: Id<'Game'>
): Promise<Array<Array<Doc<'PlayingCard'>>>> => {
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
