import React, { FormEvent, useEffect, useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from '../convex/_generated/react'
import Timer from './timer'
import Card from './card'
import CardContainer from './card_container'

type GameInfo = {
  game: Document<'Game'>
  currentPlayer: Document<'Player'>
  otherPlayers: Document<'Player'>[]
  playerToProsets: Record<string, Document<'PlayingCard'>[][]>
}
const Game = (props: {
  gameInfo: GameInfo
  cards: Document<'PlayingCard'>[]
  addWarning: (warning: string, expirationMs?: number) => void
}) => {
  const { gameInfo, cards } = props
  const { game, currentPlayer } = gameInfo
  const [selectionTimeout, setSelectionTimeout] = useState<number | null>(null)

  const startSelectSet = useMutation('startSelectSet')
  const clearSelectSet = useMutation('maybeClearSelectSet')
  const revealProset = useMutation('revealProset')
  const discardRevealedProset = useMutation('discardRevealedProset')

  setInterval(() => {
    clearSelectSet(game._id)
  }, 10 * 1000)

  const handleStartSelectSet = async () => {
    const selectResponse = await startSelectSet(game._id)
    if (selectResponse !== null) {
      props.addWarning(selectResponse.reason)
      return
    }
    const timeout = window.setTimeout(() => {
      props.addWarning('Took too long!')
      clearSelectSet(game._id)
    }, 20 * 1000)
    setSelectionTimeout(timeout)
  }

  const handleRevealProset = async () => {
    const revealedProset = await revealProset(game._id)
    setTimeout(() => {
      discardRevealedProset(game._id, revealedProset)
    }, 5 * 1000)
  }

  const onProsetFound = () => {
    props.addWarning('You found a Proset!')
    if (selectionTimeout) {
      clearTimeout(selectionTimeout)
    }
  }

  const timer = game.selectingPlayer?.equals(currentPlayer._id) ? (
    <Timer totalSeconds={20}></Timer>
  ) : null

  return (
    <React.Fragment>
      <div style={{ textAlign: 'center' }}>
        <h1>Proset</h1>
        <div>Game {game.name}</div>
        <div>
          Player {currentPlayer.name}, Score {currentPlayer.score}
        </div>
        {/* <div>
          {gameInfo.playerToProsets[`id_${currentPlayer._id.id}`].map(
            (prosetCards) => {
              return prosetCards.map((card) => (
                <Card
                  card={card}
                  onClick={() => {}}
                  selectionState="unselected"
                ></Card>
              ))
            }
          )}
        </div> */}
        <div>{gameInfo.otherPlayers.map((p) => p.name)}</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleStartSelectSet}
            disabled={game.selectingPlayer !== null}
          >
            I found a Proset!
          </button>
          <button onClick={handleRevealProset}>Reveal Proset</button>
          {timer}
        </div>
      </div>
      <CardContainer
        game={game}
        player={currentPlayer}
        cards={cards}
        onProsetFound={onProsetFound}
      ></CardContainer>
    </React.Fragment>
  )
}

export default Game
