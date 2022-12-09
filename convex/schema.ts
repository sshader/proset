import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  Game: defineTable({
    name: s.string(),
    selectingPlayer: s.union(s.null(), s.id('Player')),
    selectionStartTime: s.union(s.null(), s.number()),
  }),

  Player: defineTable({
    game: s.id('Game'),
    tokenIdentifier: s.string(),
    name: s.union(s.string(), s.null()),
    score: s.number(),
    color: s.union(
      s.literal('red'),
      s.literal('orange'),
      s.literal('yellow'),
      s.literal('green'),
      s.literal('blue'),
      s.literal('purple'),
      s.literal('grey')
    ),
    isSystemPlayer: s.boolean(),
  })
    .index('ByGameAndToken', ['game', 'tokenIdentifier'])
    .index('ByGameAndSystemPlayer', ['game', 'isSystemPlayer']),

  PlayingCard: defineTable({
    red: s.boolean(),
    orange: s.boolean(),
    yellow: s.boolean(),
    green: s.boolean(),
    blue: s.boolean(),
    purple: s.boolean(),
    game: s.id('Game'),
    rank: s.number(),
    proset: s.union(s.null(), s.id('Proset')),
    selectedBy: s.union(s.null(), s.id('Player')),
  })
    .index('ByGameAndProsetAndRank', ['game', 'proset', 'rank'])
    .index('ByGameAndProsetAndSelectedBy', ['game', 'proset', 'selectedBy']),

  Proset: defineTable({
    player: s.id('Player'),
  }).index('ByPlayer', ['player']),
})

export const PLAYER_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
] as const