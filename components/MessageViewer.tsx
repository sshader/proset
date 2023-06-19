import { api } from "../convex/_generated/api";
import { useQuery } from "convex/react";
import { Alert, Snackbar } from '@mui/material'
import { Id } from '../convex/_generated/dataModel'

const MessageViewer = ({ gameId }: { gameId: Id<'Game'> }) => {
  const messages = useQuery(api.getRecentMessages.default, { gameId }) ?? []

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
