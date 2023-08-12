import { useRouter } from 'next/router'
import { api } from '../convex/_generated/api'
import { useGameInfo } from '../hooks/GameInfoProvider'
import { useSessionMutation } from '../hooks/SessionProvider'

export default function EndGameButton() {
  const gameInfo = useGameInfo()
  const endGame = useSessionMutation(api.games.end)
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
          await endGame({ gameId: gameInfo.game._id })
          await router.push('/all')
        }}
      >
        End Game
      </button>
    </div>
  )
}
