import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Id } from '../convex/_generated/dataModel'
import { useGameInfo } from '../hooks/GameInfoProvider'
import { useSessionId } from '../hooks/SessionProvider'

export const useSendMessage = () => {
  const sessionId = useSessionId()
  const gameInfo = useGameInfo()
  const sendMessage = useMutation(api.message.send).withOptimisticUpdate(
    (localQueryStore, { content, isPrivate, gameId, sessionId }) => {
      const messages =
        localQueryStore.getQuery(api.message.list, { gameId, sessionId }) ?? []
      const newMessage = {
        _id: crypto.randomUUID() as Id<'Message'>,
        _creationTime: Date.now(),
        game: gameInfo?.game._id ?? ('' as Id<'Game'>),
        content,
        player: isPrivate ? gameInfo?.currentPlayer._id ?? null : null,
      }
      localQueryStore.setQuery(api.message.list, { gameId, sessionId }, [
        ...messages,
        newMessage,
      ])
    }
  )
  return (args: { isPrivate?: boolean; content: string }) => {
    return sendMessage({ ...args, sessionId, gameId: gameInfo.game._id })
  }
}
