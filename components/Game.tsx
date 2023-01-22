import React, { useEffect, useState } from 'react'
import { Document } from '../convex/_generated/dataModel'
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
    results: Array<Document<'PlayingCard'>>
    status: 'Exhausted' | 'CanLoadMore' | 'LoadingMore'
  }
}) => {
  const { gameInfo, cards } = props
  const { game, currentPlayer } = gameInfo
  const [selectionTimeout, setSelectionTimeout] = useState<number | null>(null)

  const startSelectSet = useMutation('startSelectSet')
  const clearSelectSet = useMutation('maybeClearSelectSet')

  const sendMessage = useSendMessage()

  const revealProset = useMutation('revealProset')
  const discardRevealedProset = useMutation('discardRevealedProset')

  useEffect(() => {
    const interval = setInterval(async () => {
      if (game.selectingPlayer !== null) {
        await clearSelectSet(game._id)
      }
    }, 10 * 1000)
    return () => clearInterval(interval)
  })

  const handleStartSelectSet = async () => {
    const selectResponse = await startSelectSet(game._id)
    if (selectResponse !== null) {
      await sendMessage(game._id, selectResponse.reason, true)
      return
    }
    const timeout = window.setTimeout(async () => {
      await sendMessage(game._id, '🐌 Too slow! Deducting a point.', true)
      await clearSelectSet(game._id)
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
    await sendMessage(
      game._id,
      `👀 Player ${currentPlayer.name} is revealing a set`,
      false
    )
    const revealedProset = await revealProset(game._id)
    setTimeout(async () => {
      await discardRevealedProset(game._id, revealedProset)
    }, 5 * 1000)
  }

  const onProsetFound = async () => {
    await sendMessage(game._id, '🎉 You found a Proset!', true)
    await sendMessage(
      game._id,
      `Player ${currentPlayer.name} found a Proset!`,
      false
    )
    if (selectionTimeout) {
      clearTimeout(selectionTimeout)
    }
  }

  return (
    <div className="Game">
      {cards.results.length === 0 ? (
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

export const Proset = ({
  cards,
}: {
  cards: Array<Document<'PlayingCard'>>
}) => {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {cards.map((card) => {
        return <Card card={card} size="mini"></Card>
      })}
    </div>
  )
}

export default Game
