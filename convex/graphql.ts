import {
  graphql,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql'
import { getPlayer } from './getPlayer'
import { Doc, Id } from './_generated/dataModel'
import { query, QueryCtx } from './_generated/server'

type QueryType = unknown

const cardType = new GraphQLObjectType<Doc<'PlayingCard'>, QueryCtx>({
  name: 'Card',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: (source) => {
        return source._id.id
      },
    },
    red: { type: GraphQLBoolean },
    orange: { type: GraphQLBoolean },
    yellow: { type: GraphQLBoolean },
    green: { type: GraphQLBoolean },
    blue: { type: GraphQLBoolean },
    purple: { type: GraphQLBoolean },
  }),
})

const prosetType = new GraphQLObjectType<Doc<'Proset'>, QueryCtx>({
  name: 'Proset',
  fields: () => ({
    cards: {
      type: new GraphQLList(cardType),
      args: {
        gameId: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (source, args, ctx) => {
        return await ctx.db
          .query('PlayingCard')
          .withIndex('ByGameAndProsetAndRank', (q) =>
            q.eq('game', new Id('Game', args.gameId)).eq('proset', source._id)
          )
          .collect()
      },
    },
  }),
})

const playerType = new GraphQLObjectType<Doc<'Player'>, QueryCtx>({
  name: 'Player',
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: (source) => {
        return source._id.id
      },
    },
    prosets: {
      type: new GraphQLList(prosetType),
      resolve: async (source, args, ctx) => {
        return await ctx.db
          .query('Proset')
          .withIndex('ByPlayer', (q) => q.eq('player', source._id))
          .collect()
      },
    },
  }),
})

const gameType = new GraphQLObjectType<Doc<'Game'>, QueryCtx>({
  name: 'Game',
  fields: () => ({
    inProgress: { type: GraphQLBoolean },
    id: {
      type: GraphQLString,
      resolve: (source) => {
        return source._id.id
      },
    },
    currentPlayer: {
      type: playerType,
      resolve: async (source, args, ctx) => {
        return await getPlayer(ctx.db, ctx.auth, source._id)
      },
    },
    allPlayers: {
      type: new GraphQLList(playerType),
      resolve: async (source, args, ctx) => {
        return await ctx.db
          .query('Player')
          .withIndex('ByGame', (q) => q.eq('game', source._id))
          .filter((q) => q.eq(q.field('isSystemPlayer'), false))
          .collect()
      },
    },
  }),
})

const queryType = new GraphQLObjectType<QueryType, QueryCtx>({
  name: 'Query',
  fields: () => ({
    game: {
      type: gameType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve: async (source, { id }, ctx) => {
        return await ctx.db.get(new Id('Game', id))
      },
    },
  }),
})

const schema = new GraphQLSchema({
  query: queryType,
  types: [gameType],
})

export default query(
  async (
    ctx,
    args: {
      query: string
      operationName?: string | null
      variables?: any
    }
  ) => {
    const result = await graphql({
      schema,
      source: args.query.trim(),
      variableValues: args.variables,
      operationName: args.operationName,
      contextValue: ctx,
    })
    // @ts-ignore -- stringify errors so they're valid convex types
    result.errors = result.errors?.map((e) => e.toString())
    return result
  }
)
