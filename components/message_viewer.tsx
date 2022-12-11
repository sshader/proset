import { Id } from '../convex/_generated/dataModel'
import { useQuery } from '../convex/_generated/react'

const MessageViewer = (props: { gameId: Id<'Game'> }) => {
  const messages = useQuery('getRecentMessages', props.gameId)
  if (messages) {
    return (
      <ul style={{ position: 'absolute', bottom: 0, right: 0 }}>
        {messages.map((message) => (
          <li style={{ color: message.player === null ? 'black' : 'blue' }}>
            {message.content}
          </li>
        ))}
      </ul>
    )
  }
  return null
}

export default MessageViewer
