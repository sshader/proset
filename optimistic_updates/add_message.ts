import { useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Id } from '../convex/_generated/dataModel'

export const useSendMessage = () => {
  return useMutation(api.sendMessage.default).withOptimisticUpdate(
    (localQueryStore, { gameId, content, isPrivate }) => {
      const messages =
        localQueryStore.getQuery(api.getRecentMessages.default, { gameId }) ??
        []
      const gameInfo = localQueryStore.getQuery(api.games.getInfo, { gameId })

      const newMessage = {
        _id: crypto.randomUUID() as Id<'Message'>,
        _creationTime: Date.now(),
        game: gameId,
        content,
        player: isPrivate ? gameInfo?.currentPlayer._id ?? null : null,
      }
      localQueryStore.setQuery(api.getRecentMessages.default, { gameId }, [
        ...messages,
        newMessage,
      ])
    }
  )
}
