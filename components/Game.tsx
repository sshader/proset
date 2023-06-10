import confetti from 'canvas-confetti'
import React, { useState } from 'react'
import { Doc } from '../convex/_generated/dataModel'
import { useMutation } from '../convex/_generated/react'
import { useSendMessage } from '../optimistic_updates/add_message'
import { GameInfo } from '../types/game_info'
import Card from './Card'
import CardContainer from './CardContainer'
import EndGameButton from './EndGameButton'
import Timer from './Timer'

const Game = (props: {
  gameInfo: GameInfo
  cards: {
    results: Array<Doc<'PlayingCard'>>
    status: 'Exhausted' | 'CanLoadMore' | 'LoadingMore' | 'LoadingFirstPage'
  }
}) => {
  const { gameInfo, cards } = props
  const { game, currentPlayer } = gameInfo
  const [selectionTimeout, setSelectionTimeout] = useState<number | null>(null)

  const startSelectSet = useMutation('startSelectSet')
  const clearSelectSet = useMutation('maybeClearSelectSet')

  const sendMessage = useSendMessage()

  const revealProset = useMutation('revealProset')

  const handleStartSelectSet = async () => {
    const selectResponse = await startSelectSet({ gameId: game._id })
    if (selectResponse !== null) {
      await sendMessage({
        gameId: game._id,
        content: selectResponse.reason,
        isPrivate: true,
      })
      return
    }
    const timeout = window.setTimeout(async () => {
      await sendMessage({
        gameId: game._id,
        content: '🐌 Too slow! Deducting a point.',
        isPrivate: true,
      })
      await clearSelectSet({ gameId: game._id })
    }, 20 * 1000)
    setSelectionTimeout(timeout)
  }

  const selectSetButton = game.selectingPlayer?.equals(currentPlayer._id) ? (
    <Timer totalSeconds={20}></Timer>
  ) : (
    <button
      onClick={handleStartSelectSet}
      disabled={game.selectingPlayer !== null}
    >
      I found a Proset!
    </button>
  )

  const handleRevealProset = async () => {
    await revealProset({ gameId: game._id })
  }

  const onProsetFound = async () => {
    await confetti({})
    if (selectionTimeout) {
      clearTimeout(selectionTimeout)
    }
  }

  return (
    <div
      className="Game"
      style={{ gap: '2em', display: 'flex', flexDirection: 'column' }}
    >
      {cards.results.length === 0 && cards.status === 'Exhausted' ? (
        <EndGameButton gameId={gameInfo.game._id} />
      ) : (
        <React.Fragment>
          <CardContainer
            gameInfo={gameInfo}
            cards={cards.results}
            onProsetFound={onProsetFound}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            {selectSetButton}
            <button
              onClick={handleRevealProset}
              disabled={game.selectingPlayer !== null}
            >
              Reveal Proset
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  )
}

export const Proset = ({ cards }: { cards: Array<Doc<'PlayingCard'>> }) => {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {cards.map((card) => {
        return <Card card={card} size="mini"></Card>
      })}
    </div>
  )
}

export default Game
