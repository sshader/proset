import { defineSchema, defineTable, s } from 'convex/schema'

export default defineSchema({
  Game: defineTable({
    name: s.string(),
  }),

  Player: defineTable({
    game: s.id('Game'),
  }),

  // Card: defineTable({
  //   red: s.boolean(),
  //   orange: s.boolean(),
  //   yellow: s.boolean(),
  //   green: s.boolean(),
  //   blue: s.boolean(),
  //   purple: s.boolean(),
  // }),

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
  }),
})

/**
 * # Proset
Game
	cards

Player
	game: Game | null


Card
	red
	orange
	…

	game
	proset: null | Proset 

Proset
	cards
	player


Frictions:
* needed to disable typechecking
* don’t need convex dev and npm run dev
* can’t pipe type check disable to the dev client portion
 */
