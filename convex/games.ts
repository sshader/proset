import { v } from 'convex/values'
import {
  internalMutationWithEnt,
  mutationWithEnt,
  mutationWithGame,
  queryWithGame,
} from './lib/functions'
import * as Games from './model/game'
import * as Players from './model/player'
import * as User from './model/user'

export const start = mutationWithEnt({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    const gameId = await Games.createGame(ctx, { isPublic: false })
    await Players.joinGame(ctx, { gameId, user })
    return { gameId }
  },
})

export const getOrCreate = mutationWithEnt({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const user = await User.get(ctx, { sessionId })
    return await Games.getOrCreate(ctx, { user })
  },
})

export const end = mutationWithGame({
  args: {},
  handler: async (ctx) => {
    const { game } = ctx
    await Games.end(ctx, game)
  },
})

/*
export interface GameInfo {
  game: Doc<'Games'>
  currentPlayer: Doc<'Players'> & { showOnboarding: boolean; isGuest: boolean }
  otherPlayers: Doc<'Players'>[]
  playerToProsets: Record<string, Doc<'PlayingCards'>[][]>
}


*/

const playerFields = {
  // from schema
  name: v.string(),
  score: v.number(),
  color: v.union(
    v.literal('red'),
    v.literal('orange'),
    v.literal('yellow'),
    v.literal('green'),
    v.literal('blue'),
    v.literal('purple'),
    v.literal('grey')
  ),
  isSystemPlayer: v.boolean(),
  // system fields
  _id: v.id('Players'),
  _creationTime: v.number(),
  // fields added by ents
  GameId: v.id('Games'),
  UserId: v.id('Users'),
}

export const getInfo = queryWithGame({
  args: {},
  returns: v.object({
    game: v.object({
      name: v.string(),
      selectingPlayer: v.union(v.null(), v.id('Players')),
      selectionStartTime: v.union(v.null(), v.number()),
      inProgress: v.boolean(),
      isPublic: v.optional(v.boolean()),
      // system fields
      _id: v.id('Games'),
      _creationTime: v.number(),
      // fields added by ents
    }),
    currentPlayer: v.object({
      ...playerFields,
      isGuest: v.boolean(),
      showOnboarding: v.boolean(),
    }),
    otherPlayers: v.array(v.object(playerFields)),
    // record
    playerToProsets: v.any(),
  }),
  handler: async (ctx) => {
    return await Games.getInfo(ctx, {
      currentPlayer: ctx.player,
      user: ctx.user,
      game: ctx.game,
    })
  },
})

export const cleanup = internalMutationWithEnt({
  args: { gameId: v.id('Games') },
  handler: (ctx, args) => {}, // Games.cleanup(ctx, args),
})

export const setup = internalMutationWithEnt({
  args: {},
  handler: async (ctx) => {
    await Games.createGame(ctx, { isPublic: true })
  },
})
