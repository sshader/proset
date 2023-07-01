import confetti from 'canvas-confetti'
import { useMutation } from 'convex/react'
import React, { useCallback, useEffect, useState } from 'react'
import { api } from '../convex/_generated/api'
import { Doc } from '../convex/_generated/dataModel'
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

  const startSelectSet = useMutation(api.startSelectSet.default)
  const clearSelectSet = useMutation(api.maybeClearSelectSet.default)

  const selectCard = useMutation(api.selectCard.default)

  const sendMessage = useSendMessage()

  const revealProset = useMutation(api.revealProset.default)

  const handleStartSelectSet = useCallback(async () => {
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
  }, [clearSelectSet, game._id, sendMessage, startSelectSet])

  const handleSelectCard = useCallback(
    async (card: Doc<'PlayingCard'> | null) => {
      if (card === null) {
        return
      }
      const selectionResult = await selectCard({ cardId: card._id })
      if (selectionResult === 'FoundProset') {
        if (selectionTimeout) {
          clearTimeout(selectionTimeout)
          setSelectionTimeout(null)
        }
        await confetti({})
      }
    },
    [selectCard, selectionTimeout]
  )
  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return // Do nothing if event already handled
      }
      // Ignore if following modifier is active.
      if (
        event.getModifierState('Control') ||
        event.getModifierState('Alt') ||
        event.getModifierState('Meta') ||
        event.getModifierState('Fn') ||
        event.getModifierState('Hyper') ||
        event.getModifierState('OS') ||
        event.getModifierState('Super') ||
        event.getModifierState('Win') /* hack for IE */
      ) {
        return
      }

      switch (event.code) {
        case 'Space':
          await handleStartSelectSet()
          break
        case 'KeyR':
          await revealProset({ gameId: game._id })
          break
        case 'Digit1':
          await handleSelectCard(cards.results[0] ?? null)
          break
        case 'Digit2':
          await handleSelectCard(cards.results[1] ?? null)
          break
        case 'Digit3':
          await handleSelectCard(cards.results[2] ?? null)
          break
        case 'Digit4':
          await handleSelectCard(cards.results[3] ?? null)
          break
        case 'Digit5':
          await handleSelectCard(cards.results[4] ?? null)
          break
        case 'Digit6':
          await handleSelectCard(cards.results[5] ?? null)
          break
        case 'Digit7':
          await handleSelectCard(cards.results[6] ?? null)
          break
        default:
          return
      }
    },
    [
      cards.results,
      game._id,
      handleSelectCard,
      handleStartSelectSet,
      revealProset,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const selectSetButton =
    game.selectingPlayer === currentPlayer._id ? (
      selectionTimeout !== null ? (
        <Timer totalSeconds={20}></Timer>
      ) : (
        <button className="btn btn-primary" disabled>
          🥳
        </button>
      )
    ) : (
      <button
        className="btn btn-primary"
        onClick={handleStartSelectSet}
        disabled={game.selectingPlayer !== null}
      >
        I found a Proset!
      </button>
    )

  const handleRevealProset = async () => {
    await revealProset({ gameId: game._id })
  }

  return (
    <div className="flex grow shrink min-w-fit justify-center">
      <div className="flex flex-col gap-4 justify-center">
        {cards.results.length === 0 && cards.status === 'Exhausted' ? (
          <EndGameButton gameId={gameInfo.game._id} />
        ) : (
          <React.Fragment>
            <CardContainer
              gameInfo={gameInfo}
              cards={cards.results}
              onCardClicked={handleSelectCard}
            />
            <div className="flex shrink min-w-0 justify-center gap-2">
              {selectSetButton}
              <button
                className="btn btn-primary"
                onClick={handleRevealProset}
                disabled={game.selectingPlayer !== null}
              >
                Reveal Proset
              </button>
            </div>
          </React.Fragment>
        )}
      </div>
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
