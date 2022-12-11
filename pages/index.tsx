import React, { FormEvent, useEffect, useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from '../convex/_generated/react'
import Game from '../components/game'
import GamePicker from '../components/game_picker'
import { useRouter } from 'next/router'

export default function App() {
  const [gameName, setGameName] = useState('')
  const [currentGame, setCurrentGame] = useState<Id<'Game'> | null>(null)

  const startGame = useMutation('startGame')
  const joinGame = useMutation('joinGame')

  const router = useRouter()

  async function handleStartGame(event: FormEvent) {
    event.preventDefault()
    setGameName('')
    const { state, gameId } = await startGame(gameName)
    if (state === 'ExistingGame') {
      console.log('Joining existing game')
    }
    setCurrentGame(gameId)
    await joinGame(gameId)
    router.push({
      pathname: '/game/[gameId]',
      query: {
        gameId: gameId.id,
      },
    })
  }

  return currentGame === null ? (
    <div>
      <GamePicker></GamePicker>
      <h1>Create a new game</h1>
      <form onSubmit={handleStartGame}>
        <input
          value={gameName}
          onChange={(event) => setGameName(event.target.value)}
          placeholder="Game name"
        />
        <input type="submit" value="Join" disabled={!gameName} />
      </form>
    </div>
  ) : (
    <div>Navigating...</div>
  )
}
