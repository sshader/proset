import { Button } from '@mui/material'
import { useRouter } from 'next/router'
import { FormEvent } from 'react'
import GamePicker from '../components/GamePicker'
import { useMutation } from '../convex/_generated/react'

export default function App() {
  const startGame = useMutation('startGame')
  const joinGame = useMutation('joinGame')

  const router = useRouter()

  async function handleStartGame(event: FormEvent) {
    event.preventDefault()
    const { gameId } = await startGame()
    await joinGame({ gameIdStr: gameId.toString() })
    await router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: gameId,
      },
    })
    return <div>Navigating...</div>
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
      <Button variant="contained" onClick={handleStartGame}>
        Start new game
      </Button>
      <GamePicker></GamePicker>
    </div>
  )
}
