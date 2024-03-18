import {  ObjectType, v } from 'convex/values'
import { QueryCtx, mutation as rawMutation, query as rawQuery } from '../_generated/server'
import * as Player from '../model/player'
import * as User from '../model/user'
import {  zCustomQuery } from './withOutputForked'
import { zCustomMutation, } from 'convex-helpers/server/zod'
import { NoOp } from 'convex-helpers/server/customFunctions'

const inGameValidator = {
  sessionId: v.string(),
  gameId: v.id('Game'),
}

// The transformation your middleware is doing
const addGameInfo = async (
  ctx: QueryCtx,
  args: ObjectType<typeof inGameValidator>
) => {
  const user = await User.get(ctx, { sessionId: args.sessionId })
  const player = await Player.getPlayer(ctx, { user, gameId: args.gameId })
  const game = await ctx.db.get(args.gameId)
  if (game === null) {
    throw new Error('Could not find game')
  }
  return { player, game, user }
}

export const queryWithGame = zCustomQuery(rawQuery, {
  args: inGameValidator,
  input: async (ctx, args) => {
    return { ctx: await addGameInfo(ctx, args), args: {}  }
  }
})


export const mutationWithGame = zCustomMutation(rawMutation, {
  args: inGameValidator,
  input: async (ctx, args) => {
    return { ctx: await addGameInfo(ctx, args), args: {}  }
  }
})

export const query = zCustomQuery(rawQuery, NoOp)
export const mutaiton = zCustomMutation(rawMutation, NoOp)