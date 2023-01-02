import { useRouter } from 'next/router'
import { FormEvent, useState } from 'react'
import GamePicker from '../components/game_picker'
import { useMutation } from '../convex/_generated/react'

export default function App() {
  const [gameName, setGameName] = useState('')

  const startGame = useMutation('startGame')
  const joinGame = useMutation('joinGame')

  const router = useRouter()

  async function handleStartGame(event: FormEvent) {
    event.preventDefault()
    setGameName('')
    const { gameId } = await startGame(gameName)
    await joinGame(gameId)
    await router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: gameId.id,
      },
    })
    return <div>Navigating...</div>
  }

  return (
    <div>
      <GamePicker></GamePicker>
      <h1>Create a new game</h1>
      <form onSubmit={handleStartGame}>
        <input
          value={gameName}
          onChange={(event) => setGameName(event.target.value)}
          placeholder="Game name"
        />
        <input type="submit" value="Join" disabled={gameName.length > 0} />
      </form>
    </div>
  )
}
