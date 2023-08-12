import { Alert, Snackbar } from '@mui/material'
import { api } from '../convex/_generated/api'
import { useGameQuery } from '../hooks/GameInfoProvider'

const MessageViewer = () => {
  const messages = useGameQuery(api.message.list, {}) ?? []

  return (
    <Snackbar open={true}>
      <div
        style={{
          maxHeight: 200,
          overflowY: 'scroll',
          gap: 5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((message, index) => (
          <Alert key={index} severity="success" sx={{ width: '100%' }}>
            {message.content}
          </Alert>
        ))}
      </div>
    </Snackbar>
  )
}

export default MessageViewer
