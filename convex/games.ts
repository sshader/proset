import { v } from 'convex/values'
import { getPlayer } from './getPlayer'
import * as Players from './players'
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
    await scheduler.runAfter(2000, 'games:internalCleanup', { gameId })
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

export const start = async (ctx: MutationCtx) => {
  const { db } = ctx
  const gameId = await db.insert('Game', {
    name: '',
    selectingPlayer: null,
    selectionStartTime: null,
    inProgress: true,
  })

  await Players.createSystemPlayer(ctx, { gameId })
  await Players.joinGame(ctx, { gameId })

  const cardNumbers = []
  for (let i = 1; i <= 63; i += 1) {
    cardNumbers.push(i)
  }
  shuffleArray(cardNumbers)

  await Promise.all(
    cardNumbers.map((cardNumber, cardIndex) => {
      return db.insert('PlayingCard', {
        game: gameId,
        rank: cardIndex,
        proset: null,
        red: cardNumber % 2 === 1,
        orange: (cardNumber >> 1) % 2 === 1,
        yellow: (cardNumber >> 2) % 2 === 1,
        green: (cardNumber >> 3) % 2 === 1,
        blue: (cardNumber >> 4) % 2 === 1,
        purple: (cardNumber >> 5) % 2 === 1,
        selectedBy: null,
      })
    })
  )

  return gameId
}

export const getOrCreate = async (ctx: MutationCtx) => {
  const { db, auth } = ctx
  const identity = await auth.getUserIdentity()
  const player = await db
    .query('Player')
    .withIndex('ByToken', (q) =>
      q.eq('tokenIdentifier', identity!.tokenIdentifier)
    )
    .order('desc')
    .first()
  if (player !== null) {
    const game = await db.get(player.game)
    if (game !== null) {
      return player.game
    }
  }
  return await start(ctx)
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}
