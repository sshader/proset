import { defineSchema, defineTable } from 'convex/schema'
import { v } from 'convex/values'

export default defineSchema({
  Game: defineTable({
    name: v.string(),
    selectingPlayer: v.union(v.null(), v.id('Player')),
    selectionStartTime: v.union(v.null(), v.number()),
    inProgress: v.boolean(),
  }),

  Player: defineTable({
    game: v.id('Game'),
    tokenIdentifier: v.string(),
    name: v.union(v.string(), v.null()),
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
  })
    .index('ByGame', ['game', 'tokenIdentifier'])
    .index('ByToken', ['tokenIdentifier']),

  PlayingCard: defineTable({
    red: v.boolean(),
    orange: v.boolean(),
    yellow: v.boolean(),
    green: v.boolean(),
    blue: v.boolean(),
    purple: v.boolean(),
    game: v.id('Game'),
    rank: v.number(),
    proset: v.union(v.null(), v.id('Proset')),
    selectedBy: v.union(v.null(), v.id('Player')),
  })
    .index('ByGameAndProsetAndRank', ['game', 'proset', 'rank'])
    .index('ByGameAndProsetAndSelectedBy', ['game', 'proset', 'selectedBy']),

  Proset: defineTable({
    player: v.id('Player'),
  }).index('ByPlayer', ['player']),

  Message: defineTable({
    content: v.string(),
    game: v.id('Game'),
    player: v.union(v.id('Player'), v.null()),
  }).index('ByGameAndCreationTime', ['game']),

  Cleanup: defineTable({
    gameId: v.id('Game'),
  }),
})
