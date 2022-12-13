import { useRouter } from 'next/router'
import { FormEvent, ReactElement, useState } from 'react'
import GamePicker from '../components/game_picker'
import { Id } from '../convex/_generated/dataModel'
import { useMutation } from '../convex/_generated/react'

export default async function App(): Promise<ReactElement> {
  const [gameName, setGameName] = useState('')
  const [currentGame, setCurrentGame] = useState<Id<'Game'> | null>(null)

  const startGame = useMutation('startGame')
  const joinGame = useMutation('joinGame')

  const router = useRouter()

  async function handleStartGame(event: FormEvent): void {
    event.preventDefault()
    setGameName('')
    const { state, gameId } = await startGame(gameName)
    if (state === 'ExistingGame') {
      console.log('Joining existing game')
    }
    setCurrentGame(gameId)
  }

  if (currentGame !== null) {
    await joinGame(currentGame)
    await router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: currentGame.id,
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
