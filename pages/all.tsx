import { Button } from '@mui/material'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/router'
import { FormEvent } from 'react'
import GamePicker from '../components/GamePicker'
import Instructions from '../components/Instructions'
import { api } from '../convex/_generated/api'

export default function App() {
  const startGame = useMutation(api.api.games.start)
  const joinGame = useMutation(api.api.players.joinGame)

  const router = useRouter()

  async function handleStartGame(event: FormEvent) {
    event.preventDefault()
    const gameId = await startGame()
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
      <GamePicker></GamePicker>
      <Button variant="contained" onClick={handleStartGame}>
        Start new game
      </Button>

      <Instructions />
    </div>
  )
}
