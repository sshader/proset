import { ObjectType, v } from 'convex/values'
import { Doc } from '../_generated/dataModel'
import { internalMutation, internalQuery, mutation, query } from '../_generated/server'
import * as Player from '../model/player'
import * as User from '../model/user'
import { customQuery, customMutation, customCtx } from "convex-helpers/server/customFunctions"
import { GenericEnt, entsTableFactory,  } from "convex-ents";
import { entDefinitions, default as schema }from "../schema";
import { CustomCtx } from "convex-helpers/server/customFunctions";
import { DataModelFromSchemaDefinition, TableNamesInDataModel } from 'convex/server'

// ----------------------------------------------------------------------
// Fill these in:

export type QueryCtx = CustomCtx<typeof queryWithGame>
export type MutationCtx = CustomCtx<typeof mutationWithGame>
export type BaseQueryCtx = CustomCtx<typeof queryWithEnt>
export type BaseMutationCtx = CustomCtx<typeof mutationWithEnt>
export type TableName = TableNamesInDataModel<DataModelFromSchemaDefinition<typeof schema>>
export type Ent<Table extends TableName> = GenericEnt<typeof entDefinitions, Table>


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
  const game = await ctx.table("Games").getX(args.gameId);
  const user = await User.get(ctx, { sessionId: args.sessionId })
  const player = await Player.getPlayer(ctx, { user, gameId: args.gameId })
  if (game === null) {
    throw new Error('Could not find game')
  }
  return { player, game, user }
}

export const internalQueryWithEnt = customQuery(internalQuery, customCtx((ctx) => {
  return { table: entsTableFactory(ctx, entDefinitions) }
}))

export const internalMutationWithEnt = customMutation(internalMutation, customCtx((ctx) => {
  return { table: entsTableFactory(ctx, entDefinitions) }
}))

export const queryWithEnt = customQuery(query, customCtx((ctx) => {
  return { table: entsTableFactory(ctx, entDefinitions) }
}))

export const mutationWithEnt = customMutation(mutation, customCtx((ctx) => {
  console.time("middleware")
  const result = { table: entsTableFactory(ctx, entDefinitions) }
  console.timeEnd("middleware")
  return result
}))


export const queryWithGame = customQuery(query, {
  args: inGameValidator,
  input: async (ctx, args) => {
    console.time("middleware")
    const table = entsTableFactory(ctx, entDefinitions);
    const gameInfo = await addGameInfo({...ctx, table}, args);
    console.timeEnd("middleware")
    return { ctx: {...gameInfo, table} , args: {} };
  }
});

export const mutationWithGame = customMutation(mutation, {
  args: inGameValidator,
  input: async (ctx, args) => {
    console.time("middleware")
    const table = entsTableFactory(ctx, entDefinitions);
    const gameInfo = await addGameInfo({...ctx, table}, args);
    console.timeEnd("middleware")
    return { ctx: {...gameInfo, table} , args: {} };
  }
});

export const internalQueryWithGame = customQuery(internalQuery, {
  args: inGameValidator,
  input: async (ctx, args) => {
    const table = entsTableFactory(ctx, entDefinitions);
    const gameInfo = await addGameInfo({...ctx, table}, args);
    return { ctx: {...gameInfo, table} , args: {} };
  }
});

export const internalMutationWithGame = customMutation(internalMutation, {
  args: inGameValidator,
  input: async (ctx, args) => {
    const table = entsTableFactory(ctx, entDefinitions);
    const gameInfo = await addGameInfo({...ctx, table}, args);
    return { ctx: {...gameInfo, table} , args: {} };
  }
});
