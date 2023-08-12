import { ObjectType, v } from 'convex/values'
import { Doc } from '../_generated/dataModel'
import { QueryCtx } from '../_generated/server'
import * as Player from '../model/player'
import * as User from '../model/user'
import {
  generateMiddlewareContextOnly,
  generateMutationWithMiddleware,
  generateQueryWithMiddleware,
} from './middlewareUtils'

// ----------------------------------------------------------------------
// Fill these in:

type RequiredContext = QueryCtx
type TransformedContext = {
  game: Doc<'Game'>
  player: Doc<'Player'>
  user: Doc<'User'>
}
const inGameValidator = {
  sessionId: v.union(v.null(), v.id('Session')),
  gameId: v.id('Game'),
}

// The transformation your middleware is doing
const addGameInfo = async (
  ctx: RequiredContext,
  args: ObjectType<typeof inGameValidator>
): Promise<TransformedContext> => {
  const user = await User.get(ctx, { sessionId: args.sessionId })
  const player = await Player.getPlayer(ctx, { user, gameId: args.gameId })
  const game = await ctx.db.get(args.gameId)
  if (game === null) {
    throw new Error('Could not find game')
  }
  return { player, game, user }
}
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// No need to modify these aside from renaming

// Helper function to allow applying this transform to multiple types of `Context`
// (e.g. QueryCtx, MutaitonCtx)
const addGameInfoGeneric = async <Ctx extends RequiredContext>(
  ctx: Ctx,
  args: ObjectType<typeof inGameValidator>
): Promise<Omit<Ctx, keyof TransformedContext> & TransformedContext> => {
  return { ...ctx, ...(await addGameInfo(ctx, args)) }
}

export const withGame = generateMiddlewareContextOnly(
  inGameValidator,
  addGameInfo
)

export const queryWithGame = generateQueryWithMiddleware(
  inGameValidator,
  addGameInfoGeneric
)

export const mutationWithGame = generateMutationWithMiddleware(
  inGameValidator,
  addGameInfoGeneric
)
