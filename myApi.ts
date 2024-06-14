import { FunctionReference, anyApi } from 'convex/server'
import { GenericId as Id } from 'convex/values'

export type PublicApiType = {
  players: {
    joinGame: FunctionReference<
      'mutation',
      'public',
      { gameId: Id<'Games'>; sessionId: string },
      null
    >
  }
  queries: {
    getOngoingGames: {
      default: FunctionReference<
        'query',
        'public',
        { sessionId: string | null },
        any
      >
    }
  }
  revealProset: {
    default: FunctionReference<
      'mutation',
      'public',
      { gameId: Id<'Games'>; sessionId: string },
      null
    >
  }
  message: {
    list: FunctionReference<
      'query',
      'public',
      { gameId: Id<'Games'>; sessionId: string },
      Array<{
        GameId: Id<'Games'>
        _creationTime: number
        _id: Id<'Messages'>
        content: string
        player: null | string
      }>
    >
    send: FunctionReference<
      'mutation',
      'public',
      {
        content: string
        gameId: Id<'Games'>
        isPrivate?: boolean
        sessionId: string
      },
      any
    >
  }
  users: {
    completeOnboarding: FunctionReference<
      'mutation',
      'public',
      { sessionId: string },
      any
    >
    getOrCreate: FunctionReference<
      'mutation',
      'public',
      { sessionId: string },
      Id<'Users'>
    >
    getOrNull: FunctionReference<
      'query',
      'public',
      { sessionId: string },
      null | {
        _creationTime: number
        _id: Id<'Users'>
        identifier: string
        isGuest: boolean
        name: string
        showOnboarding: boolean
      }
    >
  }
  cards: {
    reveal: FunctionReference<
      'mutation',
      'public',
      { gameId: Id<'Games'>; sessionId: string },
      null
    >
    select: FunctionReference<
      'mutation',
      'public',
      { cardId: Id<'PlayingCards'>; gameId: Id<'Games'>; sessionId: string },
      null
    >
    startSelectSet: FunctionReference<
      'mutation',
      'public',
      { gameId: Id<'Games'>; sessionId: string },
      null | { reason: string; selectedBy: Id<'Players'> }
    >
  }
  dealCards: {
    default: FunctionReference<
      'query',
      'public',
      {
        gameId: Id<'Games'>
        paginationOpts: {
          cursor: string | null
          endCursor?: string | null
          id?: number
          maximumBytesRead?: number
          maximumRowsRead?: number
          numItems: number
        }
      },
      {
        continueCursor: string
        isDone: boolean
        page: Array<{
          GameId: Id<'Games'>
          _creationTime: number
          _id: Id<'PlayingCards'>
          blue: boolean
          green: boolean
          orange: boolean
          proset: null | Id<'Prosets'>
          purple: boolean
          rank: number
          red: boolean
          selectedBy: null | Id<'Players'>
          yellow: boolean
        }>
        pageStatus?: 'SplitRecommended' | 'SplitRequired' | null
        splitCursor?: string | null
      }
    >
  }
  games: {
    end: FunctionReference<
      'mutation',
      'public',
      { gameId: Id<'Games'>; sessionId: string },
      any
    >
    getInfo: FunctionReference<
      'query',
      'public',
      { gameId: Id<'Games'>; sessionId: string },
      {
        currentPlayer: {
          GameId: Id<'Games'>
          UserId: Id<'Users'>
          _creationTime: number
          _id: Id<'Players'>
          color:
            | 'red'
            | 'orange'
            | 'yellow'
            | 'green'
            | 'blue'
            | 'purple'
            | 'grey'
          isGuest: boolean
          isSystemPlayer: boolean
          name: string
          score: number
          showOnboarding: boolean
        }
        game: {
          _creationTime: number
          _id: Id<'Games'>
          deletionTime?: number
          inProgress: boolean
          isPublic?: boolean
          name: string
          selectingPlayer: null | Id<'Players'>
          selectionStartTime: null | number
        }
        otherPlayers: Array<{
          GameId: Id<'Games'>
          UserId: Id<'Users'>
          _creationTime: number
          _id: Id<'Players'>
          color:
            | 'red'
            | 'orange'
            | 'yellow'
            | 'green'
            | 'blue'
            | 'purple'
            | 'grey'
          isSystemPlayer: boolean
          name: string
          score: number
        }>
        playerToProsets: any
      }
    >
    getOrCreate: FunctionReference<
      'mutation',
      'public',
      { sessionId: string },
      any
    >
    start: FunctionReference<'mutation', 'public', { sessionId: string }, any>
  }
}
export type InternalApiType = {
  message: {
    remove: FunctionReference<
      'mutation',
      'internal',
      { messageId: Id<'Messages'> },
      any
    >
  }
  cards: {
    claimSet: FunctionReference<
      'mutation',
      'internal',
      { gameId: Id<'Games'>; playerId: Id<'Players'> },
      null
    >
    discardRevealedProset: FunctionReference<
      'mutation',
      'internal',
      { cardIds: Array<Id<'PlayingCards'>>; gameId: Id<'Games'> },
      null
    >
    maybeClearSelectSet: FunctionReference<
      'mutation',
      'internal',
      { gameId: Id<'Games'> },
      null
    >
  }
  functions: {
    scheduledDelete: FunctionReference<
      'mutation',
      'internal',
      {
        inProgress: boolean
        origin: { deletionTime: number; id: string; table: string }
        stack: Array<
          | {
              edges: Array<{
                approach: 'cascade' | 'paginate'
                indexName: string
                table: string
              }>
              id: string
              table: string
            }
          | {
              approach: 'cascade' | 'paginate'
              cursor: string | null
              fieldValue: any
              indexName: string
              table: string
            }
        >
      },
      any
    >
  }
  games: {
    cleanup: FunctionReference<
      'mutation',
      'internal',
      { gameId: Id<'Games'> },
      any
    >
    setup: FunctionReference<'mutation', 'internal', Record<string, never>, any>
  }
}
export const api: PublicApiType = anyApi as unknown as PublicApiType
export const internal: InternalApiType = anyApi as unknown as InternalApiType
