import { Id } from '../convex/_generated/dataModel'
import { useQuery } from '../convex/_generated/react'

const MessageViewer = ({ gameId }: { gameId: Id<'Game'> }) => {
  const messages = useQuery('getRecentMessages', gameId)
  if (messages != null) {
    return (
      <ul style={{ position: 'fixed', bottom: 0, right: 0 }}>
        {messages.map((message) => (
          <li style={{ color: message.player === null ? 'black' : 'blue' }}>
            {message.content}
          </li>
        ))}
      </ul>
    )
  } else {
    return (
      <div className="placeholder" style={{ width: 500, height: 100 }}></div>
    )
  }
}

export default MessageViewer
