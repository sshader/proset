import { useRouter } from 'next/router'
import { FormEvent } from 'react'
import GamePicker from '../components/GamePicker'
import Instructions from '../components/Instructions'
import { api } from '../convex/_generated/api'
import { useSessionMutation } from '../hooks/SessionProvider'

export default function App() {
  const startGame = useSessionMutation(api.games.start)
  const joinGame = useSessionMutation(api.players.joinGame)

  const router = useRouter()

  async function handleStartGame(event: FormEvent) {
    event.preventDefault()
    const { gameId } = await startGame({})
    await joinGame({ gameId })
    await router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: gameId,
      },
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: 20,
        gap: 20,
      }}
    >
      <GamePicker />
      <button className="btn btn-primary" onClick={handleStartGame}>
        Start new game
      </button>

      <Instructions />
    </div>
  )
}
