import React, { FormEvent, useEffect, useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from '../convex/_generated/react'

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
  const gameInfo = useQuery('getGameInfo', props.gameId, props.playerId)

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
        game={gameInfo.game}
        player={gameInfo.player}
        cards={results}
        addWarning={props.addWarning}
      ></Game>
    )
  }
}

const Game = (props: {
  game: Document<'Game'>
  player: Document<'Player'>
  cards: Document<'PlayingCard'>[]
  addWarning: (warning: string, expirationMs?: number) => void
}) => {
  console.log(props)
  const { game, player, cards } = props
  const [selectionTimeout, setSelectionTimeout] = useState<number | null>(null)

  console.log('#### proset', findProset(cards))
  console.log('#### selectionState', selectionTimeout)

  const selectCard = useMutation('selectCard')
  const unselectCard = useMutation('unselectCard')

  const onClick = async (card: Document<'PlayingCard'>) => {
    if (!game.selectingPlayer?.equals(player._id)) {
      return
    }
    if (card.selectedBy === null) {
      const selectionResult = await selectCard(card._id, props.player._id)
      if (selectionResult === 'FoundProset' && selectionTimeout) {
        clearTimeout(selectionTimeout)
      }
    } else if (card.selectedBy.equals(props.player._id)) {
      unselectCard(card._id, props.player._id)
    }
  }

  const startSelectSet = useMutation('startSelectSet')
  const clearSelectSet = useMutation('maybeClearSelectSet')

  setInterval(() => {
    clearSelectSet(game._id)
  }, 10 * 1000)

  const handleStartSelectSet = async () => {
    const selectResponse = await startSelectSet(game._id, player._id)
    if (selectResponse !== null) {
      props.addWarning(selectResponse.reason)
      return
    }
    console.log('Setting timeout')
    const timeout = window.setTimeout(() => {
      props.addWarning('Took too long!')
      clearSelectSet(game._id)
    }, 20 * 1000)
  }

  return (
    <React.Fragment>
      <div>
        Game {game.name}, Selecting {game.selectingPlayer?.id ?? 'None'}
      </div>
      <div>Player {player._id.id}</div>
      <button
        onClick={handleStartSelectSet}
        disabled={game.selectingPlayer !== null}
      >
        Set!
      </button>
      <div className="Game-cards">
        {cards.map((card) => {
          const selectionState =
            card.selectedBy === null
              ? 'unselected'
              : card.selectedBy.equals(player._id)
              ? 'selected'
              : 'taken'
          return (
            <div key={card._id.toString()}>
              <Card
                selectionState={selectionState}
                card={card}
                onClick={onClick}
              />
            </div>
          )
        })}
      </div>
    </React.Fragment>
  )
}

const Card = (props: {
  card: Document<'PlayingCard'>
  selectionState: 'selected' | 'unselected' | 'taken'
  onClick: (card: Document<'PlayingCard'>) => Promise<any>
}) => {
  const { card } = props
  return (
    <div>
      Rank {card.rank}
      <table
        className={`Card Card--${props.selectionState}`}
        onClick={async () => {
          console.log(await props.onClick(card))
        }}
      >
        <tr>
          <td
            className="Card-dot"
            style={{
              backgroundColor: card.red ? 'red' : 'inherit',
            }}
          ></td>
          <td
            className="Card-dot"
            style={{
              backgroundColor: card.orange ? 'orange' : 'inherit',
            }}
          ></td>
        </tr>
        <tr>
          <td
            className="Card-dot"
            style={{
              backgroundColor: card.yellow ? '#f5e653' : 'inherit',
            }}
          ></td>
          <td
            className="Card-dot"
            style={{
              backgroundColor: card.green ? 'green' : 'inherit',
            }}
          ></td>
        </tr>
        <tr>
          <td
            className="Card-dot"
            style={{
              backgroundColor: card.blue ? 'blue' : 'inherit',
            }}
          ></td>
          <td
            className="Card-dot"
            style={{
              backgroundColor: card.purple ? 'purple' : 'inherit',
            }}
          ></td>
        </tr>
      </table>
    </div>
  )
}
