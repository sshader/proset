import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

/**
 * React helpers for adding session data to Convex functions.
 *
 * !Important!: To use these functions, you must wrap your code with
 * ```tsx
 *  <ConvexProvider client={convex}>
 *    <SessionProvider storageLocation={"sessionStorage"}>
 *      <App />
 *    </SessionProvider>
 *  </ConvexProvider>
 * ```
 *
 * With the `SessionProvider` inside the `ConvexProvider` but outside your app.
 */
import { FunctionReference, OptionalRestArgs } from 'convex/server'
import React, { useContext, useEffect, useState } from 'react'

const StoreKey = 'ProsetSessionId'

export const SessionContext = React.createContext<string | undefined>(undefined)

export const useSessionId = () => {
  const sessionId = useContext(SessionContext)
  if (sessionId === undefined) {
    throw new Error('Session was not set')
  }
  return sessionId
}

/**
 * Context for a Convex session, creating a server session and providing the id.
 *
 * @param props - Where you want your session ID to be persisted. Roughly:
 *  - sessionStorage is saved per-tab
 *  - localStorage is shared between tabs, but not browser profiles.
 * @returns A provider to wrap your React nodes which provides the session ID.
 * To be used with useSessionQuery and useSessionMutation.
 */
export const SessionProvider: React.FC<{
  children?: React.ReactNode
}> = ({ children }) => {
  const store =
    // If it's rendering in SSR or such.
    typeof window === 'undefined' ? null : window.localStorage
  const [sessionId, setSession] = useState<string | undefined>(undefined)
  const getOrCreateSession = useMutation(api.users.getOrCreate)

  // Get or set the ID from our desired storage location, whenever it changes.
  useEffect(() => {
    void (async () => {
      if (store === null) {
        return
      }
      const stored = store?.getItem(StoreKey) ?? crypto.randomUUID()
      setSession(stored)
      store?.setItem(StoreKey, stored)
      await getOrCreateSession({ sessionId: stored })
    })()
  }, [setSession, getOrCreateSession, store])

  if (sessionId === undefined) {
    return React.createElement(
      SessionContext.Provider,
      { value: undefined },
      React.createElement('div', {}, 'Loading')
    )
  }

  return React.createElement(
    SessionContext.Provider,
    { value: sessionId },
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

type SessionFunction<Args extends any> = FunctionReference<
  'query' | 'mutation',
  'public',
  { sessionId: string | null } & Args,
  any
>

type SessionFunctionArgs<Fn extends SessionFunction<any>> =
  keyof Fn['_args'] extends 'sessionId'
    ? EmptyObject
    : BetterOmit<Fn['_args'], 'sessionId'>

// Like useQuery, but for a Query that takes a session ID.
export function useSessionQuery<
  Query extends FunctionReference<
    'query',
    'public',
    { sessionId: string | null },
    any
  >
>(
  query: SessionFunctionArgs<Query> extends EmptyObject ? Query : never
): Query['_returnType'] | undefined
export function useSessionQuery<
  Query extends FunctionReference<
    'query',
    'public',
    { sessionId: string | null },
    any
  >
>(
  query: Query,
  args: SessionFunctionArgs<Query>
): Query['_returnType'] | undefined
export function useSessionQuery<
  Query extends FunctionReference<
    'query',
    'public',
    { sessionId: string | null },
    any
  >
>(
  query: Query,
  args?: SessionFunctionArgs<Query>
): Query['_returnType'] | undefined {
  const sessionId = useContext(SessionContext)

  if (sessionId === undefined) {
    return undefined
  }

  const newArgs = { ...args, sessionId }

  return useQuery(query, ...([newArgs] as OptionalRestArgs<Query>))
}

// Like useMutation, but for a Mutation that takes a session ID.
export const useSessionMutation = <
  Mutation extends FunctionReference<
    'mutation',
    'public',
    { sessionId: string | null },
    any
  >
>(
  name: Mutation
) => {
  const sessionId = useContext(SessionContext)
  const originalMutation = useMutation(name)

  return (
    args: SessionFunctionArgs<Mutation>
  ): Promise<Mutation['_returnType']> => {
    const newArgs = { ...args, sessionId } as Mutation['_args']
    if (sessionId === undefined) {
      throw new Error('Session was not set')
    }

    return originalMutation(...([newArgs] as OptionalRestArgs<Mutation>))
  }
}
