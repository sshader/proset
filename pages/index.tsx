import React, { FormEvent, useEffect, useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from '../convex/_generated/react'
import Timer from './timer'
import Card from './card'
import Game from './game'

export default function App() {
  const [gameName, setGameName] = useState('')
  const [currentGame, setCurrentGame] = useState<Id<'Game'> | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Id<'Player'> | null>(null)
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

  async function handleStartGame(event: FormEvent) {
    event.preventDefault()
    setGameName('')
    const { state, gameId } = await startGame(gameName)
    if (state === 'ExistingGame') {
      console.log('Joining existing game')
    }
    setCurrentGame(gameId)
    setCurrentPlayer(await joinGame(gameId))
  }

  return currentGame === null || currentPlayer === null ? (
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
    </div>
  ) : (
    <div>
      <GameBoundary
        gameId={currentGame}
        playerId={currentPlayer}
        addWarning={addWarning}
      ></GameBoundary>
      <div>{Object.values(warnings)}</div>
    </div>
  )
}

function findProset(cards: Document<'PlayingCard'>[]) {
  for (let i = 1; i <= 128; i += 1) {
    const selection = []
    for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
      if ((i >> cardIndex) % 2 === 1) {
        selection.push(cards[cardIndex])
      }
    }
    if (isProset(selection)) {
      return selection.map((c) => c.rank)
    }
  }
}

function isProset(cards: Document<'PlayingCard'>[]) {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const
  return colors.every((color) => {
    return cards.reduce(
      (isEven: boolean, currentCard: Document<'PlayingCard'>) => {
        if (currentCard[color]) {
          isEven = !isEven
        }
        return isEven
      },
      true
    )
  })
}

const GameBoundary = (props: {
  gameId: Id<'Game'>
  playerId: Id<'Player'>
  addWarning: (warning: string, expirationMs?: number) => void
}) => {
  const gameInfo = useQuery('getGameInfo', props.gameId)

  const { results, status, loadMore } = usePaginatedQuery(
    'dealCards',
    {
      initialNumItems: 7,
    },
    props.gameId
  )
  if (gameInfo === undefined || status === 'LoadingMore') {
    return <div>Loading</div>
  } else {
    if (results.length < 7 && status === 'CanLoadMore') {
      loadMore(7 - results.length)
    }
    return (
      <Game
        gameInfo={gameInfo}
        cards={results}
        addWarning={props.addWarning}
      ></Game>
    )
  }
}
