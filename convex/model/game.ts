import { Doc } from '../_generated/dataModel'
import {
  BaseMutationCtx,
  BaseQueryCtx,
  Ent,
  MutationCtx,
  QueryCtx,
} from '../lib/functions'
import { GameInfo } from '../types/game_info'
import * as Players from './player'

export const getInfo = async (
  ctx: QueryCtx,
  args: {
    currentPlayer: Ent<'Players'>
    game: Ent<'Games'>
    user: Ent<'Users'>
  }
): Promise<GameInfo> => {
  const { currentPlayer, game } = args
  const allPlayers = await ctx.game.edge('Players')
  const playerToProsets: Record<string, Doc<'PlayingCards'>[][]> = {}
  for (const player of allPlayers) {
    if (player.isSystemPlayer) {
      continue
    }
    const prosets = await getProsets(ctx, player)
    playerToProsets[player._id] = prosets
  }
  const otherPlayers = allPlayers.filter(
    (p) => p._id !== currentPlayer._id && !p.isSystemPlayer
  )
  return {
    game,
    currentPlayer: {
      ...currentPlayer,
      name: args.user.name,
      showOnboarding: args.user.showOnboarding,
      isGuest: args.user.isGuest,
    },
    otherPlayers,
    playerToProsets,
  }
}

export const end = async (ctx: MutationCtx, game: Ent<'Games'>) => {
  if (game.deletionTime !== undefined) {
    return null
  }
  await ctx.table('Games').getX(game._id).delete()
  if (game.isPublic) {
    await createGame(ctx, { isPublic: true })
  }

  return null
}

const getProsets = async (
  ctx: QueryCtx,
  player: Ent<'Players'>
): Promise<Array<Array<Doc<'PlayingCards'>>>> => {
  return player.edge('Prosets').map((proset) => proset.edge('PlayingCards'))
}

export const createGame = async (
  ctx: BaseMutationCtx,
  args: { isPublic: boolean }
) => {
  ctx.logger.time('createGame')
  const gameId = await ctx.table('Games').insert({
    name: '',
    selectingPlayer: null,
    selectionStartTime: null,
    inProgress: true,
    isPublic: args.isPublic,
  })
  ctx.logger.timeEndVerbose('createGame')

  ctx.logger.timeVerbose('createPlayer')
  await Players.createSystemPlayer(ctx, { gameId })
  ctx.logger.timeEndVerbose('createPlayer')

  ctx.logger.timeVerbose('createCards')
  const cardNumbers = []
  for (let i = 1; i <= 63; i += 1) {
    cardNumbers.push(i)
  }
  shuffleArray(cardNumbers)
  ctx.logger.timeLogVerbose('createCards', 'after shuffle')

  await Promise.all(
    cardNumbers.map((cardNumber, cardIndex) => {
      return ctx.table('PlayingCards').insert({
        GameId: gameId,
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
  ctx.logger.timeEndVerbose('createCards')

  return gameId
}

export const getPublicGame = async (ctx: BaseQueryCtx) => {
  const game = await ctx
    .table('Games', 'ByInProgressPublic', (q) =>
      q.eq('deletionTime', undefined).eq('isPublic', true)
    )
    .unique()
  if (game === null) {
    throw new Error("Couldn't find public game")
  }
  return ctx.table('Games').getX(game._id)
}

export const getOrCreate = async (
  ctx: BaseMutationCtx,
  { user }: { user: Ent<'Users'> }
) => {
  const players = await ctx.table('Users').getX(user._id).edge('Players')
  if (players.length !== 0) {
    const player = players[0]
    const game = await player.edge('Game')
    if (game !== null) {
      return { gameId: player.GameId, playerId: player._id }
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
