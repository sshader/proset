'use strict'
exports.__esModule = true
exports.PLAYER_COLORS = void 0
const schema_1 = require('convex/schema')
exports.default = (0, schema_1.defineSchema)({
  Game: (0, schema_1.defineTable)({
    name: schema_1.s.string(),
    selectingPlayer: schema_1.s.union(schema_1.s.null(), schema_1.s.id('Player')),
    selectionStartTime: schema_1.s.union(schema_1.s.null(), schema_1.s.number())
  }),
  Player: (0, schema_1.defineTable)({
    game: schema_1.s.id('Game'),
    tokenIdentifier: schema_1.s.string(),
    name: schema_1.s.union(schema_1.s.string(), schema_1.s.null()),
    score: schema_1.s.number(),
    color: schema_1.s.union(schema_1.s.literal('red'), schema_1.s.literal('orange'), schema_1.s.literal('yellow'), schema_1.s.literal('green'), schema_1.s.literal('blue'), schema_1.s.literal('purple'), schema_1.s.literal('grey')),
    isSystemPlayer: schema_1.s.boolean()
  })
    .index('ByGameAndToken', ['game', 'tokenIdentifier'])
    .index('ByGameAndSystemPlayer', ['game', 'isSystemPlayer']),
  PlayingCard: (0, schema_1.defineTable)({
    red: schema_1.s.boolean(),
    orange: schema_1.s.boolean(),
    yellow: schema_1.s.boolean(),
    green: schema_1.s.boolean(),
    blue: schema_1.s.boolean(),
    purple: schema_1.s.boolean(),
    game: schema_1.s.id('Game'),
    rank: schema_1.s.number(),
    proset: schema_1.s.union(schema_1.s.null(), schema_1.s.id('Proset')),
    selectedBy: schema_1.s.union(schema_1.s.null(), schema_1.s.id('Player'))
  })
    .index('ByGameAndProsetAndRank', ['game', 'proset', 'rank'])
    .index('ByGameAndProsetAndSelectedBy', ['game', 'proset', 'selectedBy']),
  Proset: (0, schema_1.defineTable)({
    player: schema_1.s.id('Player')
  }).index('ByPlayer', ['player'])
})
exports.PLAYER_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple'
]
