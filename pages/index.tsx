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
    <form onSubmit={handleStartGame}>
      <input
        value={gameName}
        onChange={(event) => setGameName(event.target.value)}
        placeholder="Start a new game or join an existing one"
      />
      <input type="submit" value="Send" disabled={!gameName} />
    </form>
  ) : (
    <GameBoundary gameId={currentGame} playerId={currentPlayer}></GameBoundary>
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
      ></Game>
    )
  }
}

const Game = (props: {
  game: Document<'Game'>
  player: Document<'Player'>
  cards: Document<'PlayingCard'>[]
}) => {
  console.log(props)
  const { game, player, cards } = props

  console.log('#### proset', findProset(cards))

  const selectCard = useMutation('selectCard')
  const unselectCard = useMutation('unselectCard')

  const onClick = (card: Document<'PlayingCard'>) => {
    if (card.selectedBy === null) {
      return selectCard(card._id, props.player._id)
    } else if (card.selectedBy.equals(props.player._id)) {
      unselectCard(card._id, props.player._id)
    }
  }

  return (
    <React.Fragment>
      <div>Game {game.name}</div>
      <div>Player {player._id.id}</div>
      <ul>
        {cards.map((card) => {
          const className =
            card.selectedBy === null
              ? 'unselected'
              : card.selectedBy.equals(player._id)
              ? 'selected'
              : 'taken'
          return (
            <li key={card._id.toString()}>
              <Card className={className} card={card} onClick={onClick} />
            </li>
          )
        })}
      </ul>
    </React.Fragment>
  )
}

const Card = (props: {
  card: Document<'PlayingCard'>
  className: string
  onClick: (card: Document<'PlayingCard'>) => Promise<any>
}) => {
  const { card } = props
  return (
    <div>
      Rank {card.rank}
      <table
        className={props.className}
        onClick={async () => {
          console.log(await props.onClick(card))
        }}
      >
        <tr>
          <td>{card.red ? 'R' : '_'}</td>
          <td>{card.orange ? 'O' : '_'}</td>
        </tr>
        <tr>
          <td>{card.yellow ? 'Y' : '_'}</td>
          <td>{card.green ? 'G' : '_'}</td>
        </tr>
        <tr>
          <td>{card.blue ? 'B' : '_'}</td>
          <td>{card.purple ? 'P' : '_'}</td>
        </tr>
      </table>
    </div>
  )
}
