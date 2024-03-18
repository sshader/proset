import { FunctionReference } from "convex/server"
import { GenericId as Id } from "convex/values"

export type api = { message: { list: FunctionReference<"query", "public", { gameId: Id<"Game">,
sessionId: string, }, any>
send: FunctionReference<"mutation", "public", { content: string,
gameId: Id<"Game">,
isPrivate?: boolean,
sessionId: string, }, any> }
queries: { getOngoingGames: { default: FunctionReference<"query", "public", { sessionId: string | null, }, any> } }
revealProset: { default: FunctionReference<"mutation", "public", { gameId: Id<"Game">,
sessionId: string, }, any> }
users: { completeOnboarding: FunctionReference<"mutation", "public", { sessionId: string, }, any>
getOrCreate: FunctionReference<"mutation", "public", { sessionId: string, }, any>
getOrNull: FunctionReference<"query", "public", { sessionId: string, }, any> }
cards: { reveal: FunctionReference<"mutation", "public", { gameId: Id<"Game">,
sessionId: string, }, any>
select: FunctionReference<"mutation", "public", { cardId: Id<"PlayingCard">,
gameId: Id<"Game">,
sessionId: string, }, any>
startSelectSet: FunctionReference<"mutation", "public", { gameId: Id<"Game">,
sessionId: string, }, any> }
dealCards: { default: FunctionReference<"query", "public", any, any> }
games: { end: FunctionReference<"mutation", "public", { gameId: Id<"Game">,
sessionId: string, }, any>
getInfo: FunctionReference<"query", "public", { gameId: Id<"Game">,
sessionId: string, }, any>
getOrCreate: FunctionReference<"mutation", "public", { sessionId: string, }, any>
start: FunctionReference<"mutation", "public", { sessionId: string, }, any> }
players: { joinGame: FunctionReference<"mutation", "public", { gameId: Id<"Game">,
sessionId: string, }, any> } }
    
