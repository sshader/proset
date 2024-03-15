import { v } from 'convex/values'
import { defineEnt, defineEntSchema, getEntDefinitions } from "convex-ents";

const schema = defineEntSchema({
  Games: defineEnt({
    name: v.string(),
    selectingPlayer: v.union(v.null(), v.id('Players')),
    selectionStartTime: v.union(v.null(), v.number()),
    inProgress: v.boolean(),
    isPublic: v.optional(v.boolean()),
  }).deletion("scheduled", { delayMs: 5 * 60 * 1000 })
  .edges("Players", { ref: true })
  .edges("PlayingCards", { ref: true })
  .edges("Messages", { ref: true })
  .index('ByInProgressPublic', ['deletionTime', 'isPublic']),

  Players: defineEnt({
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
  }).edge("Game").edge("User").edges("Prosets", { ref: true }),

  Users: defineEnt({
    name: v.string(),
    showOnboarding: v.boolean(),
    isGuest: v.boolean(),
  }).field(
    // Either an auth identity token identifier or a UUID
    "identifier", v.string(), { unique: true}
  ).edges("Players", { ref: true }),

  PlayingCards: defineEnt({
    red: v.boolean(),
    orange: v.boolean(),
    yellow: v.boolean(),
    green: v.boolean(),
    blue: v.boolean(),
    purple: v.boolean(),
    selectedBy: v.union(v.null(), v.id('Players')),
    proset: v.union(v.null(), v.id("Prosets")),
    rank: v.number(),
  }).edge("Game").edges("Prosets").index('ByGameAndProsetAndRank', ['GameId', 'proset', 'rank']),
    // .index('ByGameAndProsetAndSelectedBy', ['game', 'proset', 'selectedBy']),

  Prosets: defineEnt({
  }).edges("PlayingCards").edge("Player"),

  Messages: defineEnt({
    content: v.string(),
    player: v.union(v.null(), v.string())
  }).edge("Game")
})

export const entDefinitions = getEntDefinitions(schema);
export default schema;