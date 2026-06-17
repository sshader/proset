import { GenericEnt, entsTableFactory } from 'convex-ents'
import {
  CustomCtx,
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions'
import {
  DataModelFromSchemaDefinition,
  TableNamesInDataModel,
} from 'convex/server'
import { ObjectType, v } from 'convex/values'
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from '../_generated/server'
import * as Player from '../model/player'
import * as User from '../model/user'
import { entDefinitions, default as schema } from '../schema'
import { setupLogger } from './logger'

// ----------------------------------------------------------------------
// Fill these in:

export type QueryCtx = CustomCtx<typeof queryWithGame>
export type MutationCtx = CustomCtx<typeof mutationWithGame>
export type BaseQueryCtx = CustomCtx<typeof queryWithEnt>
export type BaseMutationCtx = CustomCtx<typeof mutationWithEnt>
export type TableName = TableNamesInDataModel<
  DataModelFromSchemaDefinition<typeof schema>
>
export type Ent<Table extends TableName> = GenericEnt<
  typeof entDefinitions,
  Table
>

type RequiredContext = BaseQueryCtx
type TransformedContext = {
  game: Ent<'Games'>
  player: Ent<'Players'>
  user: Ent<'Users'>
}
const inGameValidator = {
  sessionId: v.string(),
  gameId: v.id('Games'),
}

// The transformation your middleware is doing
const addGameInfo = async (
  ctx: RequiredContext,
  args: ObjectType<typeof inGameValidator>
): Promise<TransformedContext> => {
  const game = await ctx.table('Games').getX(args.gameId)
  const user = await User.get(ctx, { sessionId: args.sessionId })
  const player = await Player.getPlayer(ctx, { user, gameId: args.gameId })
  if (game === null) {
    throw new Error('Could not find game')
  }
  return { player, game, user }
}

export const internalQueryWithEnt = customQuery(
  internalQuery,
  customCtx((ctx) => {
    const logger = setupLogger()
    return { table: entsTableFactory(ctx, entDefinitions), logger }
  })
)

export const internalMutationWithEnt = customMutation(
  internalMutation,
  customCtx((ctx) => {
    const logger = setupLogger()
    return { table: entsTableFactory(ctx, entDefinitions), logger }
  })
)

export const queryWithEnt = customQuery(
  query,
  customCtx((ctx) => {
    const logger = setupLogger()
    return { table: entsTableFactory(ctx, entDefinitions), logger }
  })
)

export const mutationWithEnt = customMutation(
  mutation,
  customCtx((ctx) => {
    const logger = setupLogger()
    logger.timeVerbose('middleware')
    const result = { table: entsTableFactory(ctx, entDefinitions), logger }
    logger.timeEndVerbose('middleware')
    return result
  })
)

export const queryWithGame = customQuery(query, {
  args: inGameValidator,
  input: async (ctx, args) => {
    const table = entsTableFactory(ctx, entDefinitions)
    const logger = setupLogger()
    const gameInfo = await addGameInfo({ ...ctx, table, logger }, args)
    return { ctx: { ...gameInfo, table, logger }, args: {} }
  },
})

export const mutationWithGame = customMutation(mutation, {
  args: inGameValidator,
  input: async (ctx, args) => {
    const logger = setupLogger()
    logger.timeVerbose('middleware')
    const table = entsTableFactory(ctx, entDefinitions)
    const gameInfo = await addGameInfo({ ...ctx, table, logger }, args)
    logger.timeEndVerbose('middleware')
    return { ctx: { ...gameInfo, table, logger }, args: {} }
  },
})

export const internalQueryWithGame = customQuery(internalQuery, {
  args: inGameValidator,
  input: async (ctx, args) => {
    const table = entsTableFactory(ctx, entDefinitions)
    const logger = setupLogger()
    const gameInfo = await addGameInfo({ ...ctx, table, logger }, args)
    return { ctx: { ...gameInfo, table, logger }, args: {} }
  },
})

export const internalMutationWithGame = customMutation(internalMutation, {
  args: inGameValidator,
  input: async (ctx, args) => {
    const table = entsTableFactory(ctx, entDefinitions)
    const logger = setupLogger()
    const gameInfo = await addGameInfo({ ...ctx, table, logger }, args)
    return { ctx: { ...gameInfo, table, logger }, args: {} }
  },
})
