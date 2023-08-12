import { internal } from '../_generated/api'
import { Doc, Id } from '../_generated/dataModel'
import { DatabaseReader, MutationCtx, QueryCtx } from '../_generated/server'
import { GameInfo } from '../types/game_info'
import * as Players from './player'

export const getInfo = async (
  ctx: QueryCtx,
  args: { currentPlayer: Doc<'Player'>; game: Doc<'Game'>; user: Doc<'User'> }
): Promise<GameInfo> => {
  const { db } = ctx
  const { currentPlayer, game } = args
  const gameId = currentPlayer.game
  const allPlayers = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('isSystemPlayer'), false))
    .collect()
  const playerToProsets: Record<string, Doc<'PlayingCard'>[][]> = {}
  for (const player of allPlayers) {
    const prosets = await getProsets(db, player._id, gameId)
    playerToProsets[player._id] = prosets
  }
  const otherPlayers = allPlayers.filter((p) => p._id !== currentPlayer._id)
  return {
    game,
    currentPlayer: {
      ...currentPlayer,
      showOnboarding: args.user.showOnboarding,
      isGuest: args.user.isGuest,
    },
    otherPlayers,
    playerToProsets,
  }
}

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
  return null
}

export const end = async (ctx: MutationCtx, game: Doc<'Game'>) => {
  const { db, scheduler } = ctx
  await db.patch(game._id, {
    inProgress: false,
  })
  if (game.isPublic) {
    await createGame(ctx, { isPublic: true })
  }

  await scheduler.runAfter(2000, internal.games.cleanup, { gameId: game._id })
  return null
}

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

export const createGame = async (
  ctx: MutationCtx,
  args: { isPublic: boolean }
) => {
  const { db } = ctx
  const gameId = await db.insert('Game', {
    name: '',
    selectingPlayer: null,
    selectionStartTime: null,
    inProgress: true,
    isPublic: args.isPublic,
  })

  await Players.createSystemPlayer(ctx, { gameId })

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

export const getPublicGame = async (ctx: QueryCtx) => {
  const { db } = ctx
  const game = await db
    .query('Game')
    .withIndex('ByInProgressPublic', (q) =>
      q.eq('inProgress', true).eq('isPublic', true)
    )
    .unique()
  if (game === null) {
    throw new Error("Couldn't find public game")
  }
  return game
}

export const getOrCreate = async (
  ctx: MutationCtx,
  { user }: { user: Doc<'User'> }
) => {
  const { db } = ctx

  const player = await db
    .query('Player')
    .withIndex('ByUser', (q) => q.eq('user', user._id))
    .order('desc')
    .first()
  if (player !== null) {
    const game = await db.get(player.game)
    if (game !== null) {
      return { gameId: player.game, playerId: player._id }
    }
  }
  const game = await getPublicGame(ctx)
  const playerId = await Players.joinGame(ctx, { gameId: game._id, user })
  return { playerId, gameId: game._id }
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
