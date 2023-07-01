import { useMutation } from 'convex/react'
import { useRouter } from 'next/router'
import { api } from '../convex/_generated/api'
import { Id } from '../convex/_generated/dataModel'

export default function EndGameButton({ gameId }: { gameId: Id<'Game'> }) {
  const endGame = useMutation(api.games.end)
  const router = useRouter()

  return (
    <div
      style={{
        justifyContent: 'center',
        display: 'flex',
      }}
    >
      <button
        className="btn btn-primary"
        onClick={async () => {
          await endGame({ gameId })
          await router.push('/all')
        }}
      >
        End Game
      </button>
    </div>
  )
}
