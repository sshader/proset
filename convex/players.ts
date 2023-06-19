import {
  adjectives,
  animals,
  Config,
  uniqueNamesGenerator,
} from 'unique-names-generator'
import { PLAYER_COLORS } from '../types/player_colors'
import { Id } from './_generated/dataModel'
import { MutationCtx, QueryCtx } from './_generated/server';

const customConfig: Config = {
  dictionaries: [adjectives, animals],
  separator: ' ',
  style: 'capital',
}

export const joinGame = async (
  ctx: MutationCtx,
  { gameId }: { gameId: Id<'Game'> }
) => {
  const { db, auth } = ctx
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

export const createSystemPlayer = async (
  ctx: MutationCtx,
  { gameId }: { gameId: Id<'Game'> }
) => {
  await ctx.db.insert('Player', {
    name: 'System Player',
    game: gameId,
    tokenIdentifier: '',
    score: 0,
    color: 'grey',
    isSystemPlayer: true,
  })
}

export const getPlayer = async (ctx: QueryCtx, gameId: Id<'Game'>) => {
  const { db, auth } = ctx
  const identity = await auth.getUserIdentity()
  if (identity == null) {
    throw new Error('Called storeUser without authentication present')
  }
  const player = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('tokenIdentifier'), identity.tokenIdentifier))
    .first()
  if (player === null) {
    throw new Error('Could not find player matching auth and game')
  }
  return player
}
