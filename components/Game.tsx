import confetti from 'canvas-confetti'
import React, { useCallback, useEffect, useState } from 'react'
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

  const selectCard = useMutation('selectCard')

  const sendMessage = useSendMessage()

  const revealProset = useMutation('revealProset')

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
        await confetti({})
        if (selectionTimeout) {
          clearTimeout(selectionTimeout)
        }
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
            onCardClicked={handleSelectCard}
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
