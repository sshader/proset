import { Doc, Id } from '../_generated/dataModel'
import { MutationCtx, QueryCtx } from '../_generated/server'
import { PLAYER_COLORS } from '../types/player_colors'
import * as User from './user'

export const joinGame = async (
  ctx: MutationCtx,
  { gameId, user }: { gameId: Id<'Game'>; user: Doc<'User'> }
) => {
  const { db } = ctx
  const player = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('user'), user._id))
    .first()
  if (player !== null) {
    return { playerId: player._id, gameId: player.game }
  }
  const playerId = await db.insert('Player', {
    game: gameId,
    name: user.name,
    user: user._id,
    score: 0,
    color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
    isSystemPlayer: false,
  })
  return { playerId, gameId }
}

export const createSystemPlayer = async (
  ctx: MutationCtx,
  { gameId }: { gameId: Id<'Game'> }
) => {
  const user = await User.getOrCreate(ctx, process.env.SYSTEM_SESSION_ID!)
  await ctx.db.insert('Player', {
    game: gameId,
    name: 'System Player',
    score: 0,
    color: 'grey',
    user: user.userId,
    isSystemPlayer: true,
  })
}

export const getPlayer = async (
  ctx: QueryCtx,
  { user, gameId }: { user: Doc<'User'>; gameId: Id<'Game'> }
) => {
  const { db } = ctx
  const player = await db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('user'), user._id))
    .unique()
  if (player === null) {
    throw new Error('Could not find player for user and game')
  }
  return player
}

export const getSystemPlayer = async (
  ctx: QueryCtx,
  gameId: Id<'Game'>
): Promise<Doc<'Player'>> => {
  const player = await ctx.db
    .query('Player')
    .withIndex('ByGame', (q) => q.eq('game', gameId))
    .filter((q) => q.eq(q.field('isSystemPlayer'), true))
    .unique()
  if (player === null) {
    throw new Error('Could not find system player')
  }
  return player
}
