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
  const [warnings, setWarnings] = useState<Record<string, string>>({})

  const addWarning = (warning: string, expirationMs: number = 10000) => {
    const warningId = crypto.randomUUID()
    setWarnings({
      ...warnings,
      warningId: warning,
    })
    setTimeout(() => {
      delete warnings[warningId]
      setWarnings(warnings)
    }, expirationMs)
  }

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
      <h1>Create a new game or join an existing one</h1>
      <form onSubmit={handleStartGame}>
        <input
          value={gameName}
          onChange={(event) => setGameName(event.target.value)}
          placeholder="Game name"
        />
        <input type="submit" value="Join" disabled={!gameName} />
      </form>
      <div>{Object.values(warnings)}</div>
      <GamePicker></GamePicker>
    </div>
  ) : (
    <div>
      <div>Navigating</div>
      <div>{Object.values(warnings)}</div>
    </div>
  )
}
