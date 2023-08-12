import { useRouter } from 'next/router'
import { FormEvent } from 'react'
import GamePicker from '../components/GamePicker'
import Instructions from '../components/Instructions'
import { api } from '../convex/_generated/api'
import { useSessionMutation, useSessionQuery } from '../hooks/SessionProvider'

export default function App() {
  const startGame = useSessionMutation(api.games.start)
  const joinGame = useSessionMutation(api.players.joinGame)
  const userOrNull = useSessionQuery(api.users.getOrNull)

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
    <div className="flex flex-col items-center m-20 gap-5">
      <GamePicker />
      {userOrNull?.isGuest ? null : (
        <button className="btn btn-primary" onClick={handleStartGame}>
          Start new game
        </button>
      )}

      <Instructions />
    </div>
  )
}
