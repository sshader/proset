import { Id } from '../convex/_generated/dataModel'
import { useMutation } from '../convex/_generated/react'

export const useSendMessage = () => {
  return useMutation('sendMessage').withOptimisticUpdate(
    (localQueryStore, gameId, content, isPrivate) => {
      const messages =
        localQueryStore.getQuery('getRecentMessages', [gameId]) ?? []
      const gameInfo = localQueryStore.getQuery('getGameInfo', [gameId])

      const newMessage = {
        _id: new Id('Message', crypto.randomUUID()),
        _creationTime: Date.now(),
        game: gameId,
        content,
        player: isPrivate ? gameInfo?.currentPlayer._id ?? null : null,
      }
      localQueryStore.setQuery(
        'getRecentMessages',
        [gameId],
        [...messages, newMessage]
      )
    }
  )
}
