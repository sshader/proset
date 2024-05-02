import { Doc, Id } from '../_generated/dataModel'
import { mutation } from '../_generated/server'
import { MutationCtx, QueryCtx, Ent, BaseMutationCtx, BaseQueryCtx } from '../lib/functions'
import { PLAYER_COLORS } from '../types/player_colors'
import * as User from './user'

export const joinGame = async (
  ctx: BaseMutationCtx,
  { gameId, user }: { gameId: Id<'Games'>; user: Ent<'Users'> }
) => {
  ctx.logger.time("joinGame")
  ctx.logger.timeVerbose("getPlayer")
  const allPlayers = await ctx.table("Games").getX(gameId).edgeX("Players")
  const player = allPlayers.find(p => p.UserId === user._id) ?? null
  ctx.logger.timeEndVerbose("getPlayer")
  if (player !== null) {
    ctx.logger.timeEndVerbose("joinGame")
    return { playerId: player._id, gameId: player.GameId }
  }
  ctx.logger.timeVerbose("createPlayer")
  const playerId = await ctx.table("Players").insert({
    UserId: user._id,
    GameId: gameId,
    name: user.name,
    score: 0,
    color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
    isSystemPlayer: false,
  })
  ctx.logger.timeEndVerbose("createPlayer")
  ctx.logger.timeEnd("joinGame")
  return { playerId, gameId }
}

export const createSystemPlayer = async (
  ctx: BaseMutationCtx,
  { gameId }: { gameId: Id<'Games'> }
) => {
  const user = await User.getOrCreate(ctx, process.env.SYSTEM_SESSION_ID!)
  await ctx.table("Players").insert({
    name: 'System Player',
    score: 0,
    color: 'grey',
    UserId: user.userId,
    GameId: gameId,
    isSystemPlayer: true,
  })
}

export const getPlayer = async (
  ctx: BaseQueryCtx,
  { user, gameId }: { user: Ent<'Users'>; gameId: Id<'Games'> }
) => {
  const player = (await ctx.table("Games").getX(gameId).edge("Players")).find(p => p.UserId === user._id)
  if (player === undefined) {
    throw new Error('Could not find player for user and game')
  }
  return player
}

export const getSystemPlayer = async (
  ctx: BaseQueryCtx,
  gameId: Id<'Games'>
): Promise<Doc<'Players'>> => {
  const player = (await ctx.table("Games").getX(gameId).edge("Players")).find(p => p.isSystemPlayer)
  if (player === undefined) {
    throw new Error('Could not find system player')
  }
  return player
}