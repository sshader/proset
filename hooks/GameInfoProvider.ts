import { useMutation, useQuery } from 'convex/react'
import { FunctionReference, OptionalRestArgs } from 'convex/server'
import React, { useContext, useState } from 'react'
import { api } from '../convex/_generated/api'
import { Id } from '../convex/_generated/dataModel'
import { GameInfo } from '../convex/types/game_info'
import { SessionContext, useSessionId } from './SessionProvider'

export const GameInfoContext = React.createContext<{
  info: GameInfo | null
  id: Id<'Games'>
} | null>(null)

export const useGameInfo = () => {
  const gameInfo = useContext(GameInfoContext)
  if (gameInfo === null || gameInfo.info === null) {
    throw new Error("Game info isn't loaded yet")
  }
  return gameInfo.info
}

export const GameInfoProvider: React.FC<{
  gameId: Id<'Games'>
  children?: React.ReactNode
}> = ({ gameId, children }) => {
  const [latestKnownGameInfo, setLatestKnownGameInfo] = useState<{
    info: GameInfo | null
    id: Id<'Games'>
  }>({ info: null, id: gameId })
  const sessionId = useSessionId()
  const gameInfo = useQuery(api.games.getInfo, { gameId, sessionId })
  if (gameInfo !== undefined && gameInfo !== latestKnownGameInfo.info) {
    setLatestKnownGameInfo({ info: gameInfo, id: gameId })
  }

  if (latestKnownGameInfo.info === null) {
    return React.createElement(
      GameInfoContext.Provider,
      { value: latestKnownGameInfo },
      React.createElement('div', {}, 'Loading...')
    )
  }

  return React.createElement(
    GameInfoContext.Provider,
    { value: latestKnownGameInfo },
    children
  )
}

type EmptyObject = Record<string, never>

/**
 * An `Omit<>` type that:
 * 1. Applies to each element of a union.
 * 2. Preserves the index signature of the underlying type.
 */
declare type BetterOmit<T, K extends keyof T> = {
  [Property in keyof T as Property extends K ? never : Property]: T[Property]
}

type SessionFunction<Args> = FunctionReference<
  'query' | 'mutation',
  'public',
  { sessionId: string; gameId: Id<'Games'> } & Args,
  any
>

type SessionFunctionArgs<Fn extends SessionFunction<any>> =
  keyof Fn['_args'] extends 'sessionId' | 'gameId'
    ? EmptyObject
    : BetterOmit<Fn['_args'], 'sessionId' | 'gameId'>

// Like useQuery, but for a Query that takes a session ID.
export function useGameQuery<
  Query extends FunctionReference<
    'query',
    'public',
    { sessionId: string; gameId: Id<'Games'> },
    any
  >
>(
  query: SessionFunctionArgs<Query> extends EmptyObject ? Query : never
): Query['_returnType'] | undefined
export function useGameQuery<
  Query extends FunctionReference<
    'query',
    'public',
    { sessionId: string; gameId: Id<'Games'> },
    any
  >
>(
  query: Query,
  args: SessionFunctionArgs<Query>
): Query['_returnType'] | undefined
export function useGameQuery<
  Query extends FunctionReference<
    'query',
    'public',
    { sessionId: string; gameId: Id<'Games'> },
    any
  >
>(
  query: Query,
  args?: SessionFunctionArgs<Query>
): Query['_returnType'] | undefined {
  const sessionId = useContext(SessionContext)
  const gameInfo = useContext(GameInfoContext)

  const newArgs = { ...args, sessionId, gameId: gameInfo!.id }

  return useQuery(query, ...([newArgs] as OptionalRestArgs<Query>))
}

// Like useMutation, but for a Mutation that takes a session ID.
export const useGameMutation = <
  Mutation extends FunctionReference<
    'mutation',
    'public',
    { sessionId: string; gameId: Id<'Games'> },
    any
  >
>(
  name: Mutation
) => {
  const sessionId = useContext(SessionContext)
  const gameInfo = useContext(GameInfoContext)
  const originalMutation = useMutation(name)

  return (
    args: SessionFunctionArgs<Mutation>
  ): Promise<Mutation['_returnType']> => {
    const newArgs = { ...args, sessionId, gameId: gameInfo!.id }

    return originalMutation(...([newArgs] as OptionalRestArgs<Mutation>))
  }
}
